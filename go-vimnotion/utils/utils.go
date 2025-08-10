package utils

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
)

type EnvVars struct {
	GithubClientId  string
	GithubSecretKey string
	AuthSecret      string
}

func GetEnv() *EnvVars {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error loading .env file")
	}

	envVars := EnvVars{
		GithubClientId:  os.Getenv("GITHUB_CLIENT_ID"),
		GithubSecretKey: os.Getenv("GITHUB_SECRET_KEY"),
		AuthSecret:      os.Getenv("AUTH_SECRET"),
	}

	var pointerEnv *EnvVars
	pointerEnv = &envVars
	return pointerEnv
}
