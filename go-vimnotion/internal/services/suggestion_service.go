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

func DeleteSuggestionBySuggestionId(db *sql.DB, suggestionId string) error {
	err := repository.DeleteSuggestionById(db, suggestionId)
	if err != nil {
		return fmt.Errorf("unable to delete suggestion: %w", err)
	}

	return nil
}
