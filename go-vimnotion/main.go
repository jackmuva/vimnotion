package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"
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

func getPersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Extract user from JWT token in request
		// For now, return a placeholder response
		fmt.Printf("got directory request\n")
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, `{"message": "Directory endpoint - authentication required"}`)
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
