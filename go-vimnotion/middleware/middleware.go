package middleware

import (
	"net/http"
	"vimnotion.com/server/oauth"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "401 Unauthorized", http.StatusUnauthorized)
			return
		}

		_, err = oauth.VerifyJwt(tokenCookie.Value)
		if err != nil {
			http.Error(w, "401 Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
