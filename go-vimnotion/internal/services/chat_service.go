package services

import (
	"database/sql"
	"fmt"
	"time"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

func GetChatSessionsByEmail(db *sql.DB, email string) ([]models.ChatSession, error) {
	sessions, err := repository.GetMainChatSessionsByEmail(db, email)
	if err != nil {
		return nil, fmt.Errorf("Unable to get chat sessions from repo: %s", err)
	}
	return sessions, nil
}

func CleanUpChatSessions(db *sql.DB, email string) error {
	err := repository.DeleteChatSessionByDate(db, email, time.Now().UTC().AddDate(0, 0, -30).Format(time.RFC3339Nano))
	return err
}
