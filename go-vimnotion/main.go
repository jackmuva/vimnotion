package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"vimnotion.com/server/oauth/github"
)

const keyServerAddr = "go-vimnotion-server"

func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got / request\n")
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
	userData := oauth_github.GetGithubUser(token)
	fmt.Printf("user: %s\n", userData)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", getRoot)
	mux.HandleFunc("/oauth/github/callback", githubCallback)

	ctx := context.Background()
	server := &http.Server{
		Addr:    ":3333",
		Handler: mux,
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
