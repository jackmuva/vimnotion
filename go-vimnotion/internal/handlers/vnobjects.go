package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
)

var imageMarkdownRegex = regexp.MustCompile(`!\[.*?\]\([^)]*?/image/([a-f0-9-]+)\)`)

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

		var payload models.VnObject
		err = json.NewDecoder(r.Body).Decode(&payload)
		payload.Email = email.(string)
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

		imageRefs, err := repository.GetImageReferenceByVnObject(db, payload.Id)
		if err != nil {
			fmt.Printf("unable to get image references: %s\n", err)
		} else {
			existingRefs := make(map[string]bool)
			for _, ref := range imageRefs {
				existingRefs[ref.ImageId] = true
			}

			matches := imageMarkdownRegex.FindAllStringSubmatch(payload.Contents, -1)
			for _, match := range matches {
				if len(match) > 1 {
					imageId := match[1]
					if !existingRefs[imageId] {
						err = repository.InsertImageReference(db, imageId, payload.Id)
						if err != nil {
							fmt.Printf("unable to insert image reference: %s\n", err)
						} else {
							existingRefs[imageId] = true
						}
					}
				}
			}

			for _, ref := range imageRefs {
				if !strings.Contains(payload.Contents, ref.ImageId) {
					err = repository.DeleteImageReference(db, ref.ImageId, payload.Id)
					if err != nil {
						fmt.Printf("unable to delete image reference: %s\n", err)
						continue
					}

					count, err := repository.GetImageReferenceCount(db, ref.ImageId)
					if err != nil {
						fmt.Printf("unable to get image reference count: %s\n", err)
						continue
					}

					if count.Count == 0 {
						err = repository.DeleteImage(db, ref.ImageId)
						if err != nil {
							fmt.Printf("unable to delete image: %s\n", err)
						}
					}
				}
			}
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

func GrepVnObjects(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		searchTerm := r.URL.Query().Get("q")

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

		objs, err := repository.SearchVnObjectByContent(db, searchTerm, email.(string))
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
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonMessage)
	}
}
