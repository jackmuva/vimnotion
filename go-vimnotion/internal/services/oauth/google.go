package oauth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"vimnotion.com/server/internal/models"
)

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
	fmt.Printf("user map: %+v\n", userMap)

	userData := models.UserData{
		Username: userMap["login"].(string),
		Name:     userMap["name"].(string),
		Avatar:   userMap["avatar_url"].(string),
		Email:    GetGithubEmail(token),
	}
	return userData

}
