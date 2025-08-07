package oauth_github

import (
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
	res, resErr := http.DefaultClient.Do(req)
	resBody, bodyErr := io.ReadAll(res.Body)
	res.Body.Close()
	if reqErr != nil && resErr != nil && bodyErr != nil {
		fmt.Printf("error with github oauth flow: %s | %s | %s", reqErr, resErr, bodyErr)
	}
	fmt.Printf("successfully requested token: %s\n", resBody)
	return string(resBody)
}

//TODO:Get user data
