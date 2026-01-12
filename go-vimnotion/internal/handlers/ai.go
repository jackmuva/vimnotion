package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

func ReturnAscii() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}

		var payload models.AiMessage
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}
		var messages []models.AiMessage
		var systemMessage = models.AiMessage{
			Role:    "developer",
			Content: "You are an ASCII artist. Create ASCII art based off the user's prompt. Only draw the ASCII art, nothing else.",
		}
		messages = append(messages, systemMessage, payload)
		cfg := config.Get()
		requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
		requestBody := map[string]any{
			"model":    "openai/gpt-5-mini",
			"messages": messages,
			"stream":   false,
		}
		bodyBytes, err := json.Marshal(requestBody)
		if err != nil {
			http.Error(w, "Unable to serialize request", http.StatusInternalServerError)
			return
		}

		req, reqErr := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
		req.Header.Add("Content-Type", "application/json")
		req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)
		if reqErr != nil {
			http.Error(w, "Unable to make AI Gateway request", http.StatusInternalServerError)
			return
		}

		res, resErr := http.DefaultClient.Do(req)
		if resErr != nil {
			http.Error(w, "Unable to get AI Gateway response", http.StatusInternalServerError)
			return
		}

		body, bodyErr := io.ReadAll(res.Body)
		if bodyErr != nil {
			http.Error(w, "Unable to get AI Gateway body", http.StatusInternalServerError)
			return
		}

		var chatCompletion models.ChatCompletionResponse
		jsonErr := json.Unmarshal(body, &chatCompletion)
		if jsonErr != nil {
			http.Error(w, "Unable to deserialize AI response", http.StatusInternalServerError)
			return
		}
		res.Body.Close()

		response := struct {
			StatusCode int
			Data       models.ChatCompletionResponse
		}{
			StatusCode: 200,
			Data:       chatCompletion,
		}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonMessage)
	}
}
