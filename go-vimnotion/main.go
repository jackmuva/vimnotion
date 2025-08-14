package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"
	"vimnotion.com/server/middleware"
	"vimnotion.com/server/oauth"
	"vimnotion.com/server/oauth/github"
	"vimnotion.com/server/utils"
)

const keyServerAddr = "go-vimnotion-server"

func healthcheck(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got healthcheck request\n")
	io.WriteString(w, "This is vimnotion\n")
}

func githubCallback(w http.ResponseWriter, r *http.Request) {
	hasCode := r.URL.Query().Has("code")
	code := r.URL.Query().Get("code")
	if !hasCode {
		fmt.Printf("no code received from github\n")
		w.WriteHeader(http.StatusBadRequest)
	}
	token := oauth_github.GetGithubToken(code)
	fmt.Printf("token: %s\n", token)
	userData := oauth_github.GetGithubUser(token)
	fmt.Printf("user: %s\n", userData)
	jwt := oauth.CreateJwt(userData)
	fmt.Printf("jwt: %s\n", jwt)

	expire := time.Now().Add(time.Hour * 24 * 7)
	cookie := http.Cookie{
		Name:     "token",
		Value:    jwt,
		Expires:  expire,
		MaxAge:   60 * 60 * 24 * 7,
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
	http.Redirect(w, r, utils.GetEnv().FrontendBaseUrl, http.StatusSeeOther)
}

func getPersonalDirectory(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got healthcheck request\n")
	io.WriteString(w, "This is vimnotion\n")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", healthcheck)
	mux.HandleFunc("/oauth/github/callback", githubCallback)
	mux.Handle("/api/personal-directory", middleware.AuthMiddleware(http.HandlerFunc(getPersonalDirectory)))
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
