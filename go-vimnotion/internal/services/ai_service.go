package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

const asciiArtSystemPrompt = "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else."

func GenerateAsciiArt(w http.ResponseWriter, flusher http.Flusher, userMessage models.AiMessage) error {
	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: asciiArtSystemPrompt,
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
			"</reasoning>",
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
	for scanner.Scan() {
		line := scanner.Text()
		fmt.Fprintf(w, "%s\n", line)
		flusher.Flush()
	}

	return scanner.Err()

}
