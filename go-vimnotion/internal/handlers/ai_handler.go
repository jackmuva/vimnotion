package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
	"vimnotion.com/server/internal/utils"
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

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
			return
		}

		err = services.GenerateAsciiArt(w, flusher, payload)
		if err != nil {
			fmt.Printf("AI service error: %s\n", err)
			return
		}
	}
}

func AgentResponse(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		email, err := utils.GetEmailFromToken(r)
		if err != nil {
			http.Error(w, "Invalid auth", http.StatusBadRequest)
			return
		}
		var payload struct {
			Messages  []models.AiMessage `json:"messages"`
			SessionId string             `json:"sessionId"`
		}
		err = json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
			return
		}

		existingSession, err := repository.GetChatSessionsBySessionIdAndEmail(db, payload.SessionId, email)
		if err != nil {
			http.Error(w, "unable to get session", http.StatusInternalServerError)
			return
		}

		if len(existingSession) == 0 {
			if len(payload.Messages) == 0 || payload.Messages[0].Content == nil {
				http.Error(w, "First message content required for new session", http.StatusBadRequest)
				return
			}
			summary := *payload.Messages[0].Content
			if len(summary) > 100 {
				summary = summary[:100] + "..."
			}
			newSession := models.ChatSession{
				SessionId:  payload.SessionId,
				Messages:   payload.Messages,
				Summary:    summary,
				UpdateDate: time.Now().UTC().Format(time.RFC3339Nano),
				Email:      email,
			}
			existingSession = append(existingSession, newSession)
			err := repository.InsertChatSession(db, newSession)
			if err != nil {
				fmt.Printf("unable to create session: %s\n", payload.SessionId)
			}
		}
		err = services.CallMainAgent(w, flusher, existingSession[0], email, payload.Messages, db)
		if err != nil {
			fmt.Printf("AI service error: %s\n", err)
			return
		}
	}
}
