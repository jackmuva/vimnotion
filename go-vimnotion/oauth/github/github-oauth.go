package oauth_github

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"vimnotion.com/server/oauth"
	"vimnotion.com/server/utils"
)

func GetGithubToken(code string) string {
	requestUrl := "https://github.com/login/oauth/access_token"
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", utils.GetEnv().GithubClientId)
	data.Set("client_secret", utils.GetEnv().GithubSecretKey)

	req, reqErr := http.NewRequest(http.MethodPost, requestUrl, strings.NewReader(data.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	if reqErr != nil {
		fmt.Printf("[GITHUB TOKEN REQUEST]: %s\n", reqErr)
	}

	res, resErr := http.DefaultClient.Do(req)
	if resErr != nil {
		fmt.Printf("[GITHUB TOKEN RESPONSE]: %s\n", resErr)
	}

	body, bodyErr := io.ReadAll(res.Body)
	if bodyErr != nil {
		fmt.Printf("[GITHUB TOKEN BODY]: %s\n", bodyErr)
	}

	res.Body.Close()
	tokenValues, valErr := url.ParseQuery(string(body))
	if valErr != nil {
		fmt.Printf("error getting token values: %s\n", valErr)
	}

	fmt.Printf("token values: %s\n", tokenValues)
	return tokenValues["access_token"][0]

}

func GetGithubEmail(token string) string {
	var authSb strings.Builder
	authSb.WriteString("Bearer ")
	authSb.WriteString(token)

	requestUrl := "https://api.github.com/user/emails"

	req, reqErr := http.NewRequest(http.MethodGet, requestUrl, nil)
	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Add("Authorization", authSb.String())
	if reqErr != nil {
		fmt.Printf("[GITHUB EMAIL REQUEST]: %s\n", reqErr)
	}

	res, resErr := http.DefaultClient.Do(req)
	if resErr != nil {
		fmt.Printf("[GITHUB EMAIL RESPONSE]: %s\n", resErr)
	}

	body, bodyErr := io.ReadAll(res.Body)
	if bodyErr != nil {
		fmt.Printf("[GITHUB EMAIL BODY]: %s\n", bodyErr)
	}

	var emailMap []map[string]any
	jsonErr := json.Unmarshal(body, &emailMap)
	fmt.Printf("emailMap: %s\n", emailMap)
	if jsonErr != nil {
		fmt.Printf("[GITHUB EMAIL JSON]: %s\n", jsonErr)
	}
	res.Body.Close()

	return emailMap[0]["email"].(string)
}

func GetGithubUser(token string) oauth.UserData {
	var authSb strings.Builder
	authSb.WriteString("Bearer ")
	authSb.WriteString(token)

	requestUrl := "https://api.github.com/user"

	req, reqErr := http.NewRequest(http.MethodGet, requestUrl, nil)
	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Add("Authorization", authSb.String())
	if reqErr != nil {
		fmt.Printf("[GITHUB USER REQUEST]: %s\n", reqErr)
	}

	res, resErr := http.DefaultClient.Do(req)
	if resErr != nil {
		fmt.Printf("[GITHUB USER RESPONSE]: %s\n", resErr)
	}

	body, bodyErr := io.ReadAll(res.Body)
	if bodyErr != nil {
		fmt.Printf("[GITHUB USER BODY]: %s\n", bodyErr)
	}

	var userMap map[string]any
	jsonErr := json.Unmarshal(body, &userMap)
	fmt.Printf("userMap: %s\n", userMap)
	if jsonErr != nil {
		fmt.Printf("[GITHUB USER JSON]: %s\n", jsonErr)
	}
	res.Body.Close()

	userData := oauth.UserData{
		Username: userMap["login"].(string),
		Name:     userMap["name"].(string),
		Avatar:   userMap["avatar_url"].(string),
		Email:    GetGithubEmail(token),
	}
	return userData
}
