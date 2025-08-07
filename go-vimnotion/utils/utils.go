package utils

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
)

type EnvVars struct {
	GithubClientId  string
	GithubSecretKey string
}

func GetEnv() EnvVars {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error loading .env file")
	}

	githubClientId := os.Getenv("GITHUB_CLIENT_ID")
	githubSecretKey := os.Getenv("GITHUB_SECRET_KEY")

	return EnvVars{GithubClientId: githubClientId, GithubSecretKey: githubSecretKey}
}
