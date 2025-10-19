package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
	"sync"
)

type Config struct {
	GithubClientId   string
	GithubSecretKey  string
	AuthSecret       string
	FrontendBaseUrl  string
	TursoDatabaseUrl string
	TursoAuthToken   string
}

var config *Config
var once sync.Once

func Get() *Config {
	once.Do(func() {
		err := godotenv.Load()
		if err != nil {
			fmt.Printf("Error loading .env file")
		}

		config = &Config{
			GithubClientId:   os.Getenv("GITHUB_CLIENT_ID"),
			GithubSecretKey:  os.Getenv("GITHUB_SECRET_KEY"),
			AuthSecret:       os.Getenv("AUTH_SECRET"),
			FrontendBaseUrl:  os.Getenv("FRONTEND_BASE_URL"),
			TursoDatabaseUrl: os.Getenv("TURSO_DATABASE_URL"),
			TursoAuthToken:   os.Getenv("TURSO_AUTH_TOKEN"),
		}
	})
	return config
}
