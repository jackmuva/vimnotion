package services

import (
	"database/sql"
	"fmt"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

func GetChatSessionsByEmail(db *sql.DB, email string) ([]models.ChatSession, error) {
	sessions, err := repository.GetChatSessionsByEmail(db, email)
	if err != nil {
		return nil, fmt.Errorf("Unable to get chat sessions from repo: %s", err)
	}
	return sessions, nil
}
