package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"io"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
)

func GetImageById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		imageId := r.PathValue("id")
		objs, err := repository.GetImageById(db, imageId)
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
		image := objs[0]
		w.Header().Set("Content-Type", image.ContentType)
		w.Write(image.BinaryData)
	}
}

// TODO:Create a function for getting email from token in auth service
func InsertImage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			message := "need to auth"
			response := models.DataResponse{Message: &message, StatusCode: 400}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}

		token, err := services.VerifyJwt(tokenCookie.Value)
		if err != nil {
			message := "invalid token"
			response := models.DataResponse{Message: &message, StatusCode: 401}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		email := claims["email"]

		contentType := r.Header.Get("Content-Type")
		binaryData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("error reading body: %s\n", err)
			return
		}
		newId := uuid.New().String()
		newImage := models.Image{
			Id:          newId,
			Email:       email.(string),
			ContentType: contentType,
			BinaryData:  binaryData,
		}
		err = repository.InsertImage(db, newImage)
		if err != nil {
			http.Error(w, "Unable to create image", http.StatusBadRequest)
			fmt.Printf("error inserting image: %s\n", err)
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
