package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/joho/godotenv"
	"io"
	"net"
	"net/http"
	"os"
)

const keyServerAddr = "go-vimnotion-server"

func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got / request")
	io.WriteString(w, "This is vimnotion\n")
}

func githubCallback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	hasCode := r.URL.Query().Has("code")
	code := r.URL.Query().Get("code")
	if !hasCode {
		fmt.Printf("no code received from github")
		w.Header().Set("x-missing-filed", "q")
		w.WriteHeader(http.StatusBadRequest)
	}

}

type EnvVars struct {
	githubClientId  string
	githubSecretKey string
}

func getEnv() EnvVars {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error loading .env file")
	}

	githubClientId := os.Getenv("GITHUB_CLIENT_ID")
	githubSecretKey := os.Getenv("GITHUB_SECRET_KEY")

	return EnvVars{githubClientId: githubClientId, githubSecretKey: githubSecretKey}
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
