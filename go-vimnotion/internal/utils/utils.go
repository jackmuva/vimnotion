package utils

import (
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/internal/services"
)

func GetEmailFromToken(r *http.Request) (string, error) {
	tokenCookie, err := r.Cookie("token")
	if err != nil {
		return "", fmt.Errorf("need to auth")
	}
	token, err := services.VerifyJwt(tokenCookie.Value)
	if err != nil {
		return "", fmt.Errorf("invalid token")
	}
	claims := token.Claims.(jwt.MapClaims)
	return claims["email"].(string), nil
}
