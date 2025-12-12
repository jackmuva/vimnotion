package oauth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

func GetGoogleToken(code string) (string, error) {
	cfg := config.Get()
	requestUrl := "https://oauth2.googleapis.com/token"
	data := url.Values{}
	data.Set("client_id", cfg.GoogleClientId)
	data.Set("client_secret", cfg.GoogleSecretKey)
	data.Set("code", code)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", cfg.BackendBaseUrl+"/oauth/google/callback")

	req, reqErr := http.NewRequest(http.MethodPost, requestUrl, strings.NewReader(data.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	if reqErr != nil {
		fmt.Printf("[GOOGLE TOKEN REQUEST]: %s\n", reqErr)
	}

	res, resErr := http.DefaultClient.Do(req)
	if resErr != nil {
		fmt.Printf("[GOOGLE TOKEN RESPONSE]: %s\n", resErr)
	}

	body, bodyErr := io.ReadAll(res.Body)
	if bodyErr != nil {
		fmt.Printf("[GOOGLE TOKEN BODY]: %s\n", bodyErr)
	}

	var tokenMap map[string]any
	jsonErr := json.Unmarshal(body, &tokenMap)
	if jsonErr != nil {
		fmt.Printf("[GOOGLE USER JSON]: %s\n", jsonErr)
	}
	res.Body.Close()

	if tokenMap["access_token"] == nil {
		fmt.Printf("GOOGLE MISSING TOKEN]")
		return "", errors.New("missing token")
	}
	return tokenMap["access_token"].(string), nil
}

func GetGoogleUser(token string) models.UserData {
	var authSb strings.Builder
	authSb.WriteString("Bearer ")
	authSb.WriteString(token)
	requestUrl := "https://www.googleapis.com/oauth2/v1/userinfo?alt=json"

	req, reqErr := http.NewRequest(http.MethodGet, requestUrl, nil)
	req.Header.Add("Authorization", authSb.String())
	if reqErr != nil {
		fmt.Printf("[GOOGLE USER REQUEST]: %s\n", reqErr)
	}

	res, resErr := http.DefaultClient.Do(req)
	if resErr != nil {
		fmt.Printf("[GOOGLE USER RESPONSE]: %s\n", resErr)
	}

	body, bodyErr := io.ReadAll(res.Body)
	if bodyErr != nil {
		fmt.Printf("[GOOGLE USER BODY]: %s\n", bodyErr)
	}

	var userMap map[string]any
	jsonErr := json.Unmarshal(body, &userMap)
	if jsonErr != nil {
		fmt.Printf("[GOOGLE USER JSON]: %s\n", jsonErr)
	}
	res.Body.Close()

	userData := models.UserData{
		Username: userMap["given_name"].(string),
		Name:     userMap["name"].(string),
		Avatar:   userMap["picture"].(string),
		Email:    userMap["email"].(string),
	}
	return userData
}
