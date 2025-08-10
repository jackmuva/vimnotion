package oauth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"time"
	"vimnotion.com/server/utils"
)

type UserData struct {
	Username string
	Name     string
	Avatar   string
	Email    string
}

func CreateJwt(userData UserData) string {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":    userData.Username,
		"iat":    time.Now().Unix(),
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
		"email":  userData.Email,
		"avatar": userData.Avatar,
		"name":   userData.Name,
	})

	tokenString, tokenErr := claims.SignedString([]byte(utils.GetEnv().AuthSecret))
	if tokenErr != nil {
		fmt.Printf("[TOKEN ERROR]: %s\n", tokenErr)
	}
	return tokenString
}

func VerifyJwt(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(utils.GetEnv().AuthSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}
