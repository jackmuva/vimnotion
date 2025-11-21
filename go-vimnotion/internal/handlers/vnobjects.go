package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

func RouteVnObjectRequests(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
		case http.MethodPut:
		case http.MethodDelete:
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func GetVnObjectById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileId := r.PathValue("id")
		objs, err := repository.GetVnObjectById(db, fileId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to marshal: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
		}
		data := objs[0]
		response := struct {
			StatusCode int
			Data       models.VnObject
		}{
			StatusCode: 200,
			Data:       data,
		}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonMessage)
	}
}
