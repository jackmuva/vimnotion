package services

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

func GetImageById(db *sql.DB, id string) (*models.Image, error) {
	images, err := repository.GetImageById(db, id)
	if err != nil {
		return nil, fmt.Errorf("unable to get image: %w", err)
	}
	if len(images) == 0 {
		return nil, nil
	}
	return &images[0], nil
}

func CreateImage(db *sql.DB, email string, contentType string, binaryData []byte) (string, error) {
	newId := uuid.New().String()
	newImage := models.Image{
		Id:          newId,
		Email:       email,
		ContentType: contentType,
		BinaryData:  binaryData,
	}

	err := repository.InsertImage(db, newImage)
	if err != nil {
		return "", fmt.Errorf("unable to create image: %w", err)
	}

	return newId, nil
}
