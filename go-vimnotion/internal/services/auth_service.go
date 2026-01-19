package services

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"time"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

func CreateJwt(userData models.UserData) string {
	cfg := config.Get()
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":    userData.Username,
		"iat":    time.Now().Unix(),
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
		"email":  userData.Email,
		"avatar": userData.Avatar,
		"name":   userData.Name,
	})

	tokenString, tokenErr := claims.SignedString([]byte(cfg.AuthSecret))
	if tokenErr != nil {
		fmt.Printf("[TOKEN ERROR]: %s\n", tokenErr)
	}
	return tokenString
}

func VerifyJwt(tokenString string) (*jwt.Token, error) {
	cfg := config.Get()
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(cfg.AuthSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}
