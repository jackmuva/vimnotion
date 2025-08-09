package oauth_github

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"vimnotion.com/server/utils"
)

func GetGithubToken(code string) string {
	envVars := utils.GetEnv()

	requestUrl := "https://github.com/login/oauth/access_token"
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", envVars.GithubClientId)
	data.Set("client_secret", envVars.GithubSecretKey)

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
	fmt.Printf("successfully requested token: %s\n", body)
	tokenValues, valErr := url.ParseQuery(string(body))
	if valErr != nil {
		fmt.Printf("error getting token values: %s\n", valErr)
	}

	return tokenValues["access_token"][0]

}

func GetGithubUser(token string) map[string]interface{} {
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

	var userData map[string]interface{}
	jsonErr := json.Unmarshal(body, &userData)
	if jsonErr != nil {
		fmt.Printf("[GITHUB USER JSON]: %s\n", jsonErr)
	}

	res.Body.Close()
	return userData
}
