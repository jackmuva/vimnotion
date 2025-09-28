package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/middleware"
	"vimnotion.com/server/oauth"
	"vimnotion.com/server/oauth/github"
	"vimnotion.com/server/turso"
	"vimnotion.com/server/utils"
)

const keyServerAddr = "go-vimnotion-server"

func healthcheck(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got healthcheck request\n")
	io.WriteString(w, "This is vimnotion\n")
}

func githubCallback(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		hasCode := r.URL.Query().Has("code")
		code := r.URL.Query().Get("code")
		if !hasCode {
			fmt.Printf("no code received from github\n")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		token := oauth_github.GetGithubToken(code)
		userData := oauth_github.GetGithubUser(token)

		user := turso.GetUser(db, userData.Email)
		if len(user) == 0 {
			turso.InsertUser(db, turso.User{Email: userData.Email, Name: userData.Name})
			turso.InsertDirectoryStructure(db, turso.DirectoryStructure{Email: userData.Email,
				Structure: "{\"root/\": {\"type\":\"DIRECTORY\",\"children\":{\"trash/\":{\"type\":\"DIRECTORY\",\"children\":{}}}}}"})
		}

		jwt := oauth.CreateJwt(userData)

		expire := time.Now().Add(time.Hour * 24 * 7)
		cookie := http.Cookie{
			Name:     "token",
			Value:    jwt,
			Expires:  expire,
			MaxAge:   60 * 60 * 24 * 7,
			Path:     "/",
			HttpOnly: true,
		}
		http.SetCookie(w, &cookie)
		http.Redirect(w, r, utils.GetEnv().FrontendBaseUrl, http.StatusSeeOther)
	}
}

type DataResponse struct {
	Message    *string
	StatusCode int
	Data       *string
}

func getPersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			message := "need to auth"
			response := DataResponse{Message: &message, StatusCode: 400}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		token, err := oauth.VerifyJwt(tokenCookie.Value)
		if err != nil {
			message := "invalid token"
			response := DataResponse{Message: &message, StatusCode: 401}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		email := claims["email"]
		directory := turso.GetDirectoryStructure(db, email.(string))
		data := directory[0].Structure
		response := DataResponse{StatusCode: 200, Data: &data}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}

func main() {
	tursoDb := turso.ConnectTurso()
	defer tursoDb.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/", healthcheck)
	mux.HandleFunc("/oauth/github/callback", githubCallback(tursoDb))
	mux.Handle("/api/directory", middleware.AuthMiddleware(getPersonalDirectory(tursoDb)))
	corsHandler := middleware.EnableCors(mux)

	ctx := context.Background()
	server := &http.Server{
		Addr:    ":3333",
		Handler: corsHandler,
		BaseContext: func(l net.Listener) context.Context {
			ctx = context.WithValue(ctx, keyServerAddr, l.Addr().String())
			return ctx
		},
	}
	err := server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error listening for server: %s\n", err)
	}
}
