package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"vimnotion.com/server/internal/handlers"
	"vimnotion.com/server/internal/middleware"
	"vimnotion.com/server/internal/repository"
)

const keyServerAddr = "go-vimnotion-server"

func main() {
	tursoDb := repository.ConnectTurso()
	defer tursoDb.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/", handlers.Healthcheck)
	mux.HandleFunc("/oauth/github/callback", handlers.GithubCallback(tursoDb))
	mux.Handle("/api/directory", middleware.AuthMiddleware(handlers.GetPersonalDirectory(tursoDb)))
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
