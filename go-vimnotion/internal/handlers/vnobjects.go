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
			UpdateVnObject(db)(w, r)
		case http.MethodDelete:
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func UpdateVnObject(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payload models.VnObject
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}
		err = repository.UpdateVnObject(db, payload)
		if err != nil {
			http.Error(w, "Unable to update vnobject", http.StatusBadRequest)
			fmt.Printf("unable to updat vnobject: %s\n", err)
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
		}
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
		data := objs
		response := struct {
			StatusCode int
			Data       []models.VnObject
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

func GetPublicVnObjectById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		fileId := r.PathValue("id")
		objs, err := repository.GetPublicVnObjectById(db, fileId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to marshal: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
		}
		if len(objs) == 0 {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
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
