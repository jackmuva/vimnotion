package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

const asciiArtSystemPrompt = "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else."

func GenerateAsciiArt(userMessage models.AiMessage) (*models.ChatCompletionResponse, error) {
	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: asciiArtSystemPrompt,
	}
	messages := []models.AiMessage{systemMessage, userMessage}

	return callAiGateway(messages)
}

func callAiGateway(messages []models.AiMessage) (*models.ChatCompletionResponse, error) {
	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	requestBody := map[string]any{
		"model":    "openai/gpt-5-mini",
		"messages": messages,
		"stream":   true,
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

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("unable to read AI Gateway body: %w", err)
	}

	var chatCompletion models.ChatCompletionResponse
	err = json.Unmarshal(body, &chatCompletion)
	if err != nil {
		return nil, fmt.Errorf("unable to deserialize AI response: %w", err)
	}

	return &chatCompletion, nil
}
