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

var subagentSystemPrompt string = `You are a subagent that completes specialized tasks. 

You have the following tools: write_file_fool, read_file_tool, list_files_tool, and suggest_tool.

You as the agent have an internal file system that you can list, read, and write to with your tools.

However, the user also has files that you can only read from with the read_file_tool. Instead of writing or editing the user's files, use the suggest_tool.

When finished with the task, provide a summary of what you did and the final result`

func ExecuteAssignSubagentTool(messages []models.AiMessage, task string, subagentPrompt string, email string, session *models.ChatSession, parentSessionId string, db *sql.DB) (*string, error) {
	if len(messages) == 0 {
		messages = append(messages, models.AiMessage{
			Role:    "developer",
			Content: &subagentSystemPrompt,
		})
		messages = append(messages, models.AiMessage{
			Role:    "user",
			Content: &subagentPrompt,
		})
	}

	if session == nil {
		newSession := models.ChatSession{
			SessionId:   uuid.New().String(),
			Messages:    messages,
			Summary:     task,
			UpdateDate:  time.Now().UTC().Format(time.RFC3339Nano),
			Email:       email,
			Tokens:      0,
			MainSession: false,
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
	tools := []models.AiTool{WriteFileTool, ReadFileTool, ListFilesTool, SuggestTool}
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
	var tokens int = 0

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
		} else if chatCompletionData.Usage != nil && chatCompletionData.Usage.TotalTokens != nil {
			tokens = *chatCompletionData.Usage.TotalTokens
		}

		if isTool {
			if toolCalls, ok := chatCompletionData.Choices[0].Delta["tool_calls"].([]interface{}); ok {
				PopulateToolCallMap(toolCalls, toolCallMap)
			}
		}
	}

	if isTool && len(toolCallMap) > 0 {
		messages = AppendToolCallMessages(messages, toolCallMap, email, parentSessionId, db)
		session.Messages = messages
		session.UpdateDate = time.Now().UTC().Format(time.RFC3339Nano)
		session.Tokens = tokens
		err := repository.UpdateChatSession(db, *session)
		if err != nil {
			fmt.Printf("Unable to update session\n")
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
		messageContent, err := ExecuteAssignSubagentTool(messages, task, subagentPrompt, email, session, parentSessionId, db)
		if err != nil {
			fmt.Printf("unable to recurse\n")
			return nil, fmt.Errorf("unable to recurse subagent")
		}
		messages = append(messages, models.AiMessage{
			Role:    "assistant",
			Content: messageContent,
		})
		session.Messages = messages
		session.UpdateDate = time.Now().UTC().Format(time.RFC3339Nano)
		err = repository.UpdateChatSession(db, *session)
		if err != nil {
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
	} else if isContent {
		messages = append(messages, models.AiMessage{
			Role:    "assistant",
			Content: &content,
		})
		session.Messages = messages
		session.UpdateDate = time.Now().UTC().Format(time.RFC3339Nano)
		session.Tokens = tokens
		err := repository.UpdateChatSession(db, *session)
		if err != nil {
			return nil, fmt.Errorf("Unable to update session: %s\n", session.SessionId)
		}
	}

	if len(messages) == 0 {
		return nil, fmt.Errorf("No messages given to subagent")
	}
	return messages[len(messages)-1].Content, scanner.Err()
}
