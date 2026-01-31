package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

var asciiArtSystemPrompt = "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else."

func GenerateAsciiArt(w http.ResponseWriter, flusher http.Flusher, userMessage models.AiMessage) error {
	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: &asciiArtSystemPrompt,
	}
	messages := []models.AiMessage{systemMessage, userMessage}

	return CallAiGateway(w, flusher, messages)
}

func CallAiGateway(w http.ResponseWriter, flusher http.Flusher, messages []models.AiMessage) error {
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

var PlanTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name: "plan_tool",
		Description: "Use this tool to break down a complex ask into smaller subtasks\n" +

			"## When to use this tool:\n" +
			"Use this tool when the user asks a complex task that's better off split into smaller tasks\n" +
			"that can be done step by step\n" +

			"<example>\n" +
			"User: Proofread this article for grammatical errors and overall coherence\n" +
			"Agent: I'll proofread this article paragraph by paragraph for grammatical errors and then read the entire paper for overall coherence\n" +
			"*Creates a plan for the overall task with subtasks*\n" +
			"1. Break the article down into paragraphs\n" +
			"2. Read each paragraph checking for grammatical errors, appending each paragraph's suggestions to a suggestions file\n" +
			"3. Read entire article and comment on overall structure and messaging, appending comments to the suggestions file\n" +
			"</example>\n" +

			"<reasoning>\n" +
			"Proofreading anything longer than a few paragraphs requires breaking down the task into smaller, more manageable tasks.\n" +
			"Asking for grammar checks and coherence are two separate tasks.\n" +
			"</reasoning>\n" +

			"## When NOT to use this tool:\n" +
			"Do NOT use this tool when the user prompts a task that is small and easily achievable in a single step\n" +

			"<example>\n" +
			"User: Edit line 15 to be more concise\n" +
			"Agent: I'll check that line and immediately return a more concise version of that sentence.\n" +
			"*Does NOT create a plan with subtasks*\n" +
			"</example>\n" +

			"<reasoning>\n" +
			"Editing one sentence or even a paragraph does not require decomposing the task into subtasks.\n" +
			"</reasoning>\n",
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"subtasks": {
					Type:        "array",
					Description: "List of subtasks in the plan",
					Items: &struct {
						Type string `json:"type"`
					}{
						Type: "string",
					},
				},
			},
			Required: []string{"subtasks"},
		},
	},
}

func CallMainAgent(w http.ResponseWriter, flusher http.Flusher, messages []models.AiMessage) error {
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
		newMessages := AppendToolCallMessages(messages, toolCallMap)
		return CallMainAgent(w, flusher, newMessages)
	}

	return scanner.Err()

}

func AppendToolCallMessages(messages []models.AiMessage, toolCallMap map[string]models.ToolCallDelta) []models.AiMessage {
	var newMessages []models.AiMessage
	for _, msg := range messages {
		newMessages = append(newMessages, msg)
	}

	var toolCalls []models.AiToolCall
	for _, v := range toolCallMap {
		toolCalls = append(toolCalls, models.AiToolCall{
			Id:       *v.Id,
			Type:     "function",
			Function: v.Function,
		})
	}
	newMessages = append(newMessages, models.AiMessage{
		Role:      "assistant",
		ToolCalls: toolCalls,
	})

	for _, v := range toolCallMap {
		result := ""
		if *v.Function.Name == "plan_tool" {
			result = *v.Function.Arguments
		}
		newMessages = append(newMessages, models.AiMessage{
			Role:       "tool",
			ToolCallId: v.Id,
			Content:    &result,
		})
	}
	return newMessages
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
