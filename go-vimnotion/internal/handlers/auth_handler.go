package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
	"vimnotion.com/server/internal/services/oauth"
)

func CreateJwtCookies(userData models.UserData) (http.Cookie, http.Cookie) {
	jwt, err := services.CreateJwt(userData)
	if err != nil {
		fmt.Printf("Unable to create jwt: %s\n", err)
	}

	expire := time.Now().Add(time.Hour * 24 * 7)
	cfg := config.Get()

	cookie := http.Cookie{
		Name:     "token",
		Value:    *jwt,
		Expires:  expire,
		MaxAge:   60 * 60 * 24 * 7,
		Path:     "/",
		HttpOnly: true,
		Domain:   cfg.FrontendDomain,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}

	isAuthedCookie := http.Cookie{
		Name:     "authed",
		Value:    "true",
		Expires:  expire,
		MaxAge:   60 * 60 * 24 * 7,
		Path:     "/",
		HttpOnly: false,
		Domain:   cfg.FrontendDomain,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
	return cookie, isAuthedCookie
}

func GoogleCallback(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		hasCode := r.URL.Query().Has("code")
		if !hasCode {
			fmt.Printf("no token received from google\n")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		code := r.URL.Query().Get("code")
		token, _ := oauth.GetGoogleToken(code)
		userData := oauth.GetGoogleUser(token)

		user, err := repository.GetUser(db, userData.Email)
		if err != nil {
			fmt.Printf("Unable to get user: %s\n", err)
		}
		if len(user) == 0 {
			err := services.InitializeUserDirectory(db, userData.Email, userData.Name)
			if err != nil {
				fmt.Printf("Unable to initialize user directory: %s\n", err)
			}
		}

		cookie, isAuthedCookie := CreateJwtCookies(userData)
		cfg := config.Get()

		http.SetCookie(w, &cookie)
		http.SetCookie(w, &isAuthedCookie)
		http.Redirect(w, r, cfg.FrontendBaseUrl, http.StatusSeeOther)
	}
}

func GithubCallback(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		hasCode := r.URL.Query().Has("code")
		if !hasCode {
			fmt.Printf("no code received from github\n")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		code := r.URL.Query().Get("code")
		token := oauth.GetGithubToken(code)
		userData := oauth.GetGithubUser(token)

		user, err := repository.GetUser(db, userData.Email)
		if err != nil {
			fmt.Printf("Unable to get user: %s\n", err)
		}
		if len(user) == 0 {
			err := services.InitializeUserDirectory(db, userData.Email, userData.Name)
			if err != nil {
				fmt.Printf("Unable to initialize user directory: %s\n", err)
			}
		}

		cookie, isAuthedCookie := CreateJwtCookies(userData)
		cfg := config.Get()

		http.SetCookie(w, &cookie)
		http.SetCookie(w, &isAuthedCookie)
		http.Redirect(w, r, cfg.FrontendBaseUrl, http.StatusSeeOther)
	}
}
