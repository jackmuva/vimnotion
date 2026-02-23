package aitools

import (
	"bufio"
	"bytes"
	"database/sql"
	_ "embed"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed assign_subagent_tool_description.md
var assignSubagentDescription string

var AssignSubagentTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "assign_subagent_tool",
		Description: assignSubagentDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"task": {
					Type:        "string",
					Description: "Short task description",
				},
				"subagentPrompt": {
					Type:        "string",
					Description: "Concise prompt with all necessary context to complete the subagent's task",
				},
			},
			Required: []string{"task", "subagentPrompt"},
		},
	},
}

func ExecuteAssignSubagentTool(messages []models.AiMessage, task string, subagentPrompt string, email string, session *models.ChatSession, db *sql.DB) (*string, error) {
	if len(messages) == 0 {
		var sysPrompt string = `You are a subagent that completes specialized tasks. 

			When finished with the task, provide a summary of what you did and the final result`
		messages = append(messages, models.AiMessage{
			Role:    "developer",
			Content: &sysPrompt,
		})
		messages = append(messages, models.AiMessage{
			Role:    "user",
			Content: &subagentPrompt,
		})
	}

	if session == nil {
		newSession := models.ChatSession{
			SessionId:  uuid.New().String(),
			Messages:   messages,
			Summary:    task,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		}
		err := repository.InsertChatSession(db, newSession)
		if err != nil {
			fmt.Printf("Unable to create chat session\n")
			return nil, fmt.Errorf("Unable to create chat session")
		}
		session = &newSession
	}

	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	var tools []models.AiTool
	tools = append(tools, PlanTool)
	requestBody := map[string]any{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   true,
		"tools":    tools,
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Printf("unable to serialize request\n")
		return nil, fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		fmt.Printf("unable to create AI Gateway request\n")
		return nil, fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("unable to get AI Gateway response\n")
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("AI Gateway returned status: %v \n", resp)
		return nil, fmt.Errorf("AI Gateway returned status %d", resp.StatusCode)
	}

	scanner := bufio.NewScanner(resp.Body)
	var isTool bool = false
	var isContent bool = false
	content := ""
	var toolCallMap = make(map[string]models.ToolCallDelta)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		data := line[6:]
		if data == "[DONE]" {
			break
		}

		var chatCompletionData models.ChatCompletionData
		err := json.Unmarshal([]byte(data), &chatCompletionData)
		if err != nil {
			continue
		}

		if len(chatCompletionData.Choices) == 0 {
			continue
		}

		if _, ok := chatCompletionData.Choices[0].Delta["tool_calls"]; ok {
			isTool = true
		} else if _, ok := chatCompletionData.Choices[0].Delta["content"]; ok {
			isContent = true
			content += chatCompletionData.Choices[0].Delta["content"].(string)
		}
		if isTool {
			if toolCalls, ok := chatCompletionData.Choices[0].Delta["tool_calls"].([]interface{}); ok {
				populateToolCallMap(toolCalls, toolCallMap)
			}
		}
	}

	if isTool && len(toolCallMap) > 0 {
		messages = AppendToolCallMessages(messages, toolCallMap, email, session.SessionId, db)
		err := repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  session.SessionId,
			Messages:   messages,
			Summary:    session.Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			fmt.Printf("Unable to update session\n")
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
		messageContent, err := ExecuteAssignSubagentTool(messages, task, subagentPrompt, email, session, db)
		if err != nil {
			fmt.Printf("unable to recurse\n")
			return nil, fmt.Errorf("unable to recurse subagent")
		}
		messages = append(messages, models.AiMessage{
			Role:    "assistant",
			Content: messageContent,
		})
		err = repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  session.SessionId,
			Messages:   messages,
			Summary:    session.Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
	} else if isContent {
		messages = append(messages, models.AiMessage{
			Role:    "assistant",
			Content: &content,
		})
		err := repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  session.SessionId,
			Messages:   messages,
			Summary:    session.Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
	}

	if len(messages) == 0 {
		return nil, fmt.Errorf("No messages given to subagent")
	}
	return messages[len(messages)-1].Content, scanner.Err()
}

func populateToolCallMap(toolCalls []interface{}, toolCallMap map[string]models.ToolCallDelta) {
	for _, tcRaw := range toolCalls {
		tcBytes, _ := json.Marshal(tcRaw)
		var tc models.ToolCallDelta
		if err := json.Unmarshal(tcBytes, &tc); err != nil {
			continue
		}
		if tc.Id != nil {
			if existing, ok := toolCallMap[*tc.Id]; ok {
				if tc.Function.Name != nil {
					*existing.Function.Name += *tc.Function.Name
				}
				if tc.Function.Arguments != nil {
					*existing.Function.Arguments += *tc.Function.Arguments
				}
				toolCallMap[*tc.Id] = existing
			} else {
				toolCallMap[*tc.Id] = tc
			}
		} else {
			for id, existing := range toolCallMap {
				if existing.Index == tc.Index {
					if tc.Function.Arguments != nil {
						*existing.Function.Arguments += *tc.Function.Arguments
					}
					toolCallMap[id] = existing
					break
				}
			}
		}
	}
}

func AppendToolCallMessages(messages []models.AiMessage, toolCallMap map[string]models.ToolCallDelta,
	email string, sessionId string, db *sql.DB) []models.AiMessage {
	var toolCalls []models.AiToolCall
	for _, v := range toolCallMap {
		toolCalls = append(toolCalls, models.AiToolCall{
			Id:       *v.Id,
			Type:     "function",
			Function: v.Function,
		})
	}
	messages = append(messages, models.AiMessage{
		Role:      "assistant",
		ToolCalls: toolCalls,
	})

	for _, v := range toolCallMap {
		var execRes string
		args := *v.Function.Arguments
		if *v.Function.Name == "plan_tool" {
			var planArgs struct {
				PlanName string   `json:"planName"`
				Subtasks []string `json:"subtasks"`
			}
			err := json.Unmarshal([]byte(args), &planArgs)
			if err != nil {
				break
			}
			todos, err := ExecutePlanTool(planArgs.PlanName, planArgs.Subtasks, email, sessionId, db)
			if err != nil {
				execRes = "Error executing plan tool"
			} else {
				execRes = *todos
			}
		} else if *v.Function.Name == "write_file_tool" {
			var writeArgs struct {
				FileName     string `json:"fileName"`
				FileContents string `json:"fileContents"`
			}
			err := json.Unmarshal([]byte(args), &writeArgs)
			if err != nil {
				execRes = "Error parsing write file arguments"
				break
			}
			err = ExecuteWriteFileTool(writeArgs.FileName, writeArgs.FileContents, email, sessionId, db)
			if err != nil {
				execRes = "Error writing file"
			} else {
				execRes = fmt.Sprintf("File '%s' written successfully", writeArgs.FileName)
			}
		} else if *v.Function.Name == "read_file_tool" {
			var readArgs struct {
				FileName string `json:"fileName"`
			}
			err := json.Unmarshal([]byte(args), &readArgs)
			if err != nil {
				execRes = "Error parsing read file arguments"
				break
			}
			fileContents, err := ExecuteReadFileTool(readArgs.FileName, email, sessionId, db)
			if err != nil {
				fmt.Printf("Error reading file")
				execRes = fmt.Sprintf("Error reading file: %s", err.Error())
			} else {
				execRes = *fileContents
			}
		} else if *v.Function.Name == "list_files_tool" {
			fileNames, err := ExecuteListFilesTool(email, sessionId, db)
			if err != nil {
				fmt.Printf("Error listing files")
				execRes = fmt.Sprintf("Error listing files: %s", err.Error())
			} else {
				filesJson, jsonErr := json.Marshal(fileNames)
				if jsonErr != nil {
					execRes = "Error serializing file list"
				} else {
					execRes = string(filesJson)
				}
			}
		}
		messages = append(messages, models.AiMessage{
			Role:       "tool",
			ToolCallId: v.Id,
			Content:    &execRes,
		})
	}
	return messages
}
