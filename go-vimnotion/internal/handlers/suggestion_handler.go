package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func RouteSuggestionRequests(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodDelete:
			DeleteSuggestion(db)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func DeleteSuggestion(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		suggId := r.PathValue("id")
		err := services.DeleteSuggestionBySuggestionId(db, suggId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}
	}
}
