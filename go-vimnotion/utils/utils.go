package utils

import (
	"fmt"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	GithubClientId  string
	GithubSecretKey string
	AuthSecret      string
	FrontendBaseUrl string
	Neo4jUri        string
	Neo4jUsername   string
	Neo4jPassword   string
}

var envVars *EnvVars
var once sync.Once

func GetEnv() *EnvVars {
	once.Do(func() {
		err := godotenv.Load()
		if err != nil {
			fmt.Printf("Error loading .env file")
		}

		envVars = &EnvVars{
			GithubClientId:  os.Getenv("GITHUB_CLIENT_ID"),
			GithubSecretKey: os.Getenv("GITHUB_SECRET_KEY"),
			AuthSecret:      os.Getenv("AUTH_SECRET"),
			FrontendBaseUrl: os.Getenv("FRONTEND_BASE_URL"),
			Neo4jUri:        os.Getenv("NEO4J_URI"),
			Neo4jUsername:   os.Getenv("NEO4J_USERNAME"),
			Neo4jPassword:   os.Getenv("NEO4J_PW"),
		}
	})
	return envVars
}
