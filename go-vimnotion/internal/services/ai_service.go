package services

import (
	"bufio"
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services/ai_tools"
)

var asciiArtSystemPrompt = "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else."

func GenerateAsciiArt(w http.ResponseWriter, flusher http.Flusher, userMessage models.AiMessage) error {
	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: &asciiArtSystemPrompt,
	}
	messages := []models.AiMessage{systemMessage, userMessage}

	return OneshotAi(w, flusher, messages)
}

func OneshotAi(w http.ResponseWriter, flusher http.Flusher, messages []models.AiMessage) error {
	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	requestBody := map[string]any{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   true,
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("AI Gateway returned status %d", resp.StatusCode)
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		fmt.Fprintf(w, "%s\n", line)
		flusher.Flush()
	}

	return scanner.Err()
}

func CallMainAgent(w http.ResponseWriter, flusher http.Flusher, session models.ChatSession, email string, messages []models.AiMessage, db *sql.DB) error {
	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	tools := []models.AiTool{aitools.PlanTool, aitools.AssignSubagentTool, aitools.WriteFileTool, aitools.ReadFileTool, aitools.ListFilesTool, aitools.SuggestionSubagentTool}
	requestBody := map[string]any{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   true,
		"tools":    tools,
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("AI Gateway returned status %d", resp.StatusCode)
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
				fmt.Fprintf(w, "%s\n", line)
				fmt.Printf("%s\n", line)
				flusher.Flush()
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
				PopulateToolCallMap(toolCalls, toolCallMap)
			}
		}
		fmt.Fprintf(w, "%s\n", line)
		fmt.Printf("%s\n", line)
		flusher.Flush()
	}

	if isTool && len(toolCallMap) > 0 {
		newMessages := AppendToolCallMessages(messages, toolCallMap, email, session.SessionId, db)
		err := repository.UpdateChatSession(db, models.ChatSession{
			SessionId:  session.SessionId,
			Messages:   newMessages,
			Summary:    session.Summary,
			UpdateDate: time.Now().UTC().String(),
			Email:      email,
		})
		if err != nil {
			fmt.Printf("Unable to update session: %s\n", session.SessionId)
		}
		return CallMainAgent(w, flusher, session, email, newMessages, db)
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
			fmt.Printf("Unable to update session: %s\n", session.SessionId)
		}
	}

	return scanner.Err()
}

func PopulateToolCallMap(toolCalls []interface{}, toolCallMap map[string]models.ToolCallDelta) {
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

func AppendToolCallMessages(messages []models.AiMessage, toolCallMap map[string]models.ToolCallDelta, email string, sessionId string, db *sql.DB) []models.AiMessage {
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
			todos, err := aitools.ExecutePlanTool(planArgs.PlanName, planArgs.Subtasks, email, sessionId, db)
			if err != nil {
				execRes = "Error executing plan tool"
			} else {
				execRes = *todos
			}
		} else if *v.Function.Name == "assign_subagent_tool" {
			var subagentArgs struct {
				Task           string `json:"task"`
				SubagentPrompt string `json:"subagentPrompt"`
			}
			err := json.Unmarshal([]byte(args), &subagentArgs)
			if err != nil {
				break
			}
			subagentResponse, err := aitools.ExecuteAssignSubagentTool(messages, subagentArgs.Task, subagentArgs.SubagentPrompt, email, nil, db)
			if err != nil {
				execRes = "Error executing subagent tool"
			} else {
				execRes = *subagentResponse
			}
		} else if *v.Function.Name == "write_file_tool" {

		} else if *v.Function.Name == "read_file_tool" {

		} else if *v.Function.Name == "list_files_tool" {

		} else if *v.Function.Name == "suggestion_subagent_tool" {

		}

		messages = append(messages, models.AiMessage{
			Role:       "tool",
			ToolCallId: v.Id,
			Content:    &execRes,
		})
	}
	return messages
}
