package services

import (
	"database/sql"
	"fmt"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

func GetSuggestionsByFileId(db *sql.DB, fileId string) ([]models.Suggestion, error) {
	suggestions, err := repository.GetSuggestionsByVnObjectId(db, fileId)
	if err != nil {
		return nil, fmt.Errorf("unable to get suggestions for vn: %s", err)
	}
	return suggestions, nil
}
