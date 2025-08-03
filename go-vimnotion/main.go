package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
)

const keyServerAddr = "serverAddr"

func getRoot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	hasQ := r.URL.Query().Has("q")
	q := r.URL.Query().Get("q")
	if !hasQ {
		w.Header().Set("x-missing-filed", "q")
		w.WriteHeader(http.StatusBadRequest)
	}
	fmt.Printf("%s: got / request. %t=%s\n", ctx.Value(keyServerAddr), hasQ, q)
	io.WriteString(w, "This is vimnotion\n")
}

func getHello(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Printf("could not read body: %s", err)
	}
	fmt.Printf("%s: got /hello request. Body: \n%s\n", ctx.Value(keyServerAddr), body)
	io.WriteString(w, "Hello\n")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", getRoot)
	mux.HandleFunc("/hello", getHello)

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
