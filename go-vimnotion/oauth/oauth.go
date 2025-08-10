package oauth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/utils"
)

type UserData struct {
	Username string
	Name     string
	Avatar   string
	Email    string
}

func CreateJwt(userData UserData) string {
	envPointer := utils.GetEnv()
	envVars := *envPointer

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":    userData.Username,
		"iat":    time.Now().Unix(),
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
		"email":  userData.Email,
		"avatar": userData.Avatar,
		"name":   userData.Name,
	})

	tokenString, tokenErr := claims.SignedString([]byte(envVars.AuthSecret))
	if tokenErr != nil {
		fmt.Printf("[TOKEN ERROR]: %s\n", tokenErr)
	}
	return tokenString
}
