package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func HandlePersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			GetPersonalDirectory(db)(w, r)
		case http.MethodPut:
			UpdatePersonalDirectory(db)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func GetPersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		cookie, isAuthedCookie, err := refreshCookies(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		email, err := getEmailFromToken(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		structure, err := services.GetDirectoryStructure(db, email)
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		response := models.DataResponse{StatusCode: 200, Data: &structure}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}

		http.SetCookie(w, cookie)
		http.SetCookie(w, isAuthedCookie)
		w.Write(jsonMessage)
	}
}

func UpdatePersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		email, err := getEmailFromToken(r)
		if err != nil {
			writeAuthError(w, err.Error())
			return
		}

		var payload struct {
			Structure string
			Changes   models.DirectoryChanges
		}
		err = json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}

		err = services.UpdateDirectoryStructure(db, email, payload.Structure, payload.Changes)
		if err != nil {
			message := err.Error()
			response := models.DataResponse{Message: &message, StatusCode: 500}
			jsonMessage, _ := json.Marshal(response)
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		response := models.DataResponse{StatusCode: 200}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}

func getEmailFromToken(r *http.Request) (string, error) {
	tokenCookie, err := r.Cookie("token")
	if err != nil {
		return "", fmt.Errorf("need to auth")
	}
	token, err := services.VerifyJwt(tokenCookie.Value)
	if err != nil {
		return "", fmt.Errorf("invalid token")
	}
	claims := token.Claims.(jwt.MapClaims)
	return claims["email"].(string), nil
}

func writeAuthError(w http.ResponseWriter, message string) {
	response := models.DataResponse{Message: &message, StatusCode: 401}
	jsonMessage, _ := json.Marshal(response)
	http.Error(w, string(jsonMessage), http.StatusUnauthorized)
}

func refreshCookies(r *http.Request) (*http.Cookie, *http.Cookie, error) {
	tokenCookie, err := r.Cookie("token")
	if err != nil {
		fmt.Printf("need to auth\n")
		return nil, nil, err
	}
	token, err := services.VerifyJwt(tokenCookie.Value)
	if err != nil {
		fmt.Printf("invalid token\n")
		return nil, nil, err
	}
	claims := token.Claims.(jwt.MapClaims)
	userData := models.UserData{
		Email:    claims["email"].(string),
		Username: claims["sub"].(string),
		Name:     claims["name"].(string),
		Avatar:   claims["avatar"].(string),
	}
	cookie, isAuthedCookie := CreateJwtCookies(userData)

	return &cookie, &isAuthedCookie, nil
}
