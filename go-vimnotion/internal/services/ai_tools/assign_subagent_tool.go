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

func ExecuteAssignSubagentTool(task string, subagentPrompt string, email string, sessionId string, db *sql.DB) (*string, error) {
	var messages []models.AiMessage

	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	var tools []models.AiTool
	//TODO:Add relevant tools
	tools = append(tools, PlanTool)
	requestBody := map[string]any{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   true,
		"tools":    tools,
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
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
			if !isTool {
				// fmt.Fprintf(w, "%s\n", line)
				fmt.Printf("%s\n", line)
				// flusher.Flush()
			}
			break
		}

		var chatCompletionData models.ChatCompletionData
		err := json.Unmarshal([]byte(data), &chatCompletionData)
		if err != nil {
			fmt.Println(err)
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
		// fmt.Fprintf(w, "%s\n", line)
		fmt.Printf("%s\n", line)
		// flusher.Flush()
	}

	if isTool && len(toolCallMap) > 0 {
		newMessages := AppendToolCallMessages(messages, toolCallMap, email, sessionId, db)
		err := repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  sessionId,
			Messages:   newMessages,
			Summary:    existingSession[0].Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			fmt.Printf("Unable to update session: %s\n", sessionId)
		}
		return ExecuteAssignSubagentTool(sessionId, email, newMessages, db)
	} else if isContent {
		messages = append(messages, models.AiMessage{
			Role:    "assistant",
			Content: &content,
		})
		err := repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  sessionId,
			Messages:   messages,
			Summary:    existingSession[0].Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			fmt.Printf("Unable to update session: %s\n", sessionId)
		}
	}

	return nil, scanner.Err()
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
			if err == nil {
				execRes = "Error executing plan tool"
			}
			execRes = *todos
		}
		//TODO:Update the rest of the tools
		messages = append(messages, models.AiMessage{
			Role:       "tool",
			ToolCallId: v.Id,
			Content:    &execRes,
		})
	}
	return messages
}
