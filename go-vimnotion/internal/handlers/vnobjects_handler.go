package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func RouteVnObjectRequests(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
		case http.MethodPut:
			UpdateVnObject(db)(w, r)
		case http.MethodDelete:
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func UpdateVnObject(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		email, err := getEmailFromToken(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		var payload models.VnObject
		err = json.NewDecoder(r.Body).Decode(&payload)
		payload.Email = email
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}

		err = services.UpdateVnObject(db, payload)
		if err != nil {
			http.Error(w, "Unable to update vnobject", http.StatusBadRequest)
			fmt.Printf("unable to update vnobject: %s\n", err)
			return
		}

		response := models.DataResponse{StatusCode: 200}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonMessage)
	}
}

func GetVnObjectById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		fileId := r.PathValue("id")
		objs, err := services.GetVnObjectById(db, fileId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		response := struct {
			StatusCode int
			Data       []models.VnObject
		}{
			StatusCode: 200,
			Data:       objs,
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

func GetPublicVnObjectById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		fileId := r.PathValue("id")
		obj, err := services.GetPublicVnObjectById(db, fileId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		if obj == nil {
			http.Error(w, "Object not found", http.StatusNotFound)
			return
		}

		response := struct {
			StatusCode int
			Data       models.VnObject
		}{
			StatusCode: 200,
			Data:       *obj,
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

func GrepVnObjects(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		email, err := getEmailFromToken(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		searchTerm := r.URL.Query().Get("q")
		objs, err := services.SearchVnObjects(db, searchTerm, email)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		if len(objs) == 0 {
			http.Error(w, "No results found", http.StatusNotFound)
			return
		}

		response := struct {
			StatusCode int
			Data       []models.VnObject
		}{
			StatusCode: 200,
			Data:       objs,
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
