package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
	"vimnotion.com/server/internal/utils"
)

func GetAllChatSessionResponse(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		email, err := utils.GetEmailFromToken(r)
		if err != nil {
			http.Error(w, "Invalid auth", http.StatusBadRequest)
			return
		}
		sessions, err := services.GetChatSessionsByEmail(db, email)
		if err != nil {
			http.Error(w, "Unable to retrieve sessions", http.StatusInternalServerError)
			return
		}
		response := struct {
			StatusCode int
			Data       []models.ChatSession
		}{
			StatusCode: 200,
			Data:       sessions,
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
