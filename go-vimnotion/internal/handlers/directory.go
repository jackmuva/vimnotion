package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
)

func GetPersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
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
		directory := repository.GetDirectoryStructure(db, email.(string))
		data := directory[0].Structure
		response := models.DataResponse{StatusCode: 200, Data: &data}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}
