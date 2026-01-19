package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func GetImageById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		imageId := r.PathValue("id")
		image, err := services.GetImageById(db, imageId)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		if image == nil {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", image.ContentType)
		w.Write(image.BinaryData)
	}
}

func InsertImage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		email, err := getEmailFromToken(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		contentType := r.Header.Get("Content-Type")
		binaryData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("error reading body: %s\n", err)
			return
		}

		newId, err := services.CreateImage(db, email, contentType, binaryData)
		if err != nil {
			http.Error(w, "Unable to create image", http.StatusBadRequest)
			fmt.Printf("error creating image: %s\n", err)
			return
		}

		response := models.DataResponse{StatusCode: 200, Data: &newId}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}
