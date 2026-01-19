package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func ReturnAscii() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var payload models.AiMessage
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}

		chatCompletion, err := services.GenerateAsciiArt(payload)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			fmt.Printf("AI service error: %s\n", err)
			return
		}

		response := struct {
			StatusCode int
			Data       models.ChatCompletionResponse
		}{
			StatusCode: 200,
			Data:       *chatCompletion,
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
