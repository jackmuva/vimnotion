package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

const asciiArtSystemPrompt = "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else."

func GenerateAsciiArt(userMessage models.AiMessage) ([]string, error) {
	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: asciiArtSystemPrompt,
	}
	messages := []models.AiMessage{systemMessage, userMessage}

	return callAiGateway(messages)
}

func callAiGateway(messages []models.AiMessage) ([]string, error) {
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

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	scanner := bufio.NewScanner(resp.Body)
	var lines []string
	for scanner.Scan() {
		line := scanner.Text()
		lines = append(lines, line)
		fmt.Fprintln(os.Stdout, line)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("Unable to get text from stream")
	}
	return lines, nil
}
