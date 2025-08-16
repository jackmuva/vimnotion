package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"vimnotion.com/server/oauth"
	"vimnotion.com/server/utils"
)

type ErrorMessage struct {
	Message string
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			jsonMessage, jsonErr := json.Marshal(ErrorMessage{Message: "need to auth"})
			if jsonErr != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}

			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}

		_, err = oauth.VerifyJwt(tokenCookie.Value)
		if err != nil {
			http.Error(w, "401 Bad Token", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func EnableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigins := []string{utils.GetEnv().FrontendBaseUrl}

		origin := r.Header.Get("Origin")
		if slices.Contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Content-Type", "application/json")

		next.ServeHTTP(w, r)
	})
}
