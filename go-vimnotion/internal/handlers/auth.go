package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
	"vimnotion.com/server/internal/services/oauth/github"
)

func GithubCallback(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		hasCode := r.URL.Query().Has("code")
		code := r.URL.Query().Get("code")
		if !hasCode {
			fmt.Printf("no code received from github\n")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		token := github.GetGithubToken(code)
		userData := github.GetGithubUser(token)

		user := repository.GetUser(db, userData.Email)
		if len(user) == 0 {
			rootId := uuid.New().String()
			trashId := uuid.New().String()
			var structureBuilder strings.Builder
			structureBuilder.WriteString("{\"")
			structureBuilder.WriteString(rootId)
			structureBuilder.WriteString("|root/\": {\"type\":\"DIRECTORY\",\"children\":{\"")
			structureBuilder.WriteString(trashId)
			structureBuilder.WriteString("|trash/\":{\"type\":\"DIRECTORY\",\"children\":{}}}}}")

			repository.InsertUser(db, models.User{Email: userData.Email, Name: userData.Name})
			repository.InsertDirectoryStructure(db, models.DirectoryStructure{
				Email:     userData.Email,
				Structure: structureBuilder.String(),
			})
			repository.InsertVnObject(db, models.VnObject{
				Id:         rootId,
				Name:       "root",
				IsFile:     false,
				Contents:   "",
				UpdateDate: time.Now().UTC().String(),
			})
			repository.InsertVnObject(db, models.VnObject{
				Id:         trashId,
				Name:       "trash",
				IsFile:     false,
				Contents:   "",
				UpdateDate: time.Now().UTC().String(),
			})

		}

		jwt := services.CreateJwt(userData)

		expire := time.Now().Add(time.Hour * 24 * 7)
		cookie := http.Cookie{
			Name:     "token",
			Value:    jwt,
			Expires:  expire,
			MaxAge:   60 * 60 * 24 * 7,
			Path:     "/",
			HttpOnly: true,
		}
		http.SetCookie(w, &cookie)
		cfg := config.Get()
		http.Redirect(w, r, cfg.FrontendBaseUrl, http.StatusSeeOther)
	}
}
