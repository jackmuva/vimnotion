package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/services"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			jsonMessage, jsonErr := json.Marshal(models.ErrorMessage{Message: "need to auth", StatusCode: 401})
			if jsonErr != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			fmt.Printf("error at auth middleware, %s\n", err)
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}

		_, err = services.VerifyJwt(tokenCookie.Value)
		if err != nil {
			http.Error(w, "401 Bad Token", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func EnableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg := config.Get()
		allowedOrigins := []string{cfg.FrontendBaseUrl}

		origin := r.Header.Get("Origin")
		if slices.Contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
