package services

import (
	"database/sql"
	"fmt"
	"regexp"
	"strings"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

var imageMarkdownRegex = regexp.MustCompile(`!\[.*?\]\([^)]*?/image/([a-f0-9-]+)\)`)

func GetVnObjectById(db *sql.DB, id string) ([]models.VnObject, error) {
	objs, err := repository.GetVnObjectById(db, id)
	if err != nil {
		return nil, fmt.Errorf("unable to get vnobject: %w", err)
	}
	return objs, nil
}

func GetPublicVnObjectById(db *sql.DB, id string) (*models.VnObject, error) {
	objs, err := repository.GetPublicVnObjectById(db, id)
	if err != nil {
		return nil, fmt.Errorf("unable to get public vnobject: %w", err)
	}
	if len(objs) == 0 {
		return nil, nil
	}
	return &objs[0], nil
}

func SearchVnObjects(db *sql.DB, searchTerm string, email string) ([]models.VnObject, error) {
	objs, err := repository.SearchVnObjectByContent(db, searchTerm, email)
	if err != nil {
		return nil, fmt.Errorf("unable to search vnobjects: %w", err)
	}
	return objs, nil
}

func UpdateVnObject(db *sql.DB, vnObject models.VnObject) error {
	err := repository.UpdateVnObject(db, vnObject)
	if err != nil {
		return fmt.Errorf("unable to update vnobject: %w", err)
	}

	if err := syncImageReferences(db, vnObject); err != nil {
		fmt.Printf("warning: failed to sync image references: %s\n", err)
	}

	return nil
}

func syncImageReferences(db *sql.DB, vnObject models.VnObject) error {
	imageRefs, err := repository.GetImageReferenceByVnObject(db, vnObject.Id)
	if err != nil {
		return fmt.Errorf("unable to get image references: %w", err)
	}

	existingRefs := make(map[string]bool)
	for _, ref := range imageRefs {
		existingRefs[ref.ImageId] = true
	}

	matches := imageMarkdownRegex.FindAllStringSubmatch(vnObject.Contents, -1)
	for _, match := range matches {
		if len(match) > 1 {
			imageId := match[1]
			if !existingRefs[imageId] {
				err = repository.InsertImageReference(db, imageId, vnObject.Id)
				if err != nil {
					fmt.Printf("unable to insert image reference: %s\n", err)
				} else {
					existingRefs[imageId] = true
				}
			}
		}
	}

	for _, ref := range imageRefs {
		if !strings.Contains(vnObject.Contents, ref.ImageId) {
			err = repository.DeleteImageReference(db, ref.ImageId, vnObject.Id)
			if err != nil {
				fmt.Printf("unable to delete image reference: %s\n", err)
				continue
			}

			count, err := repository.GetImageReferenceCount(db, ref.ImageId)
			if err != nil {
				fmt.Printf("unable to get image reference count: %s\n", err)
				continue
			}

			if count.Count == 0 {
				err = repository.DeleteImage(db, ref.ImageId)
				if err != nil {
					fmt.Printf("unable to delete image: %s\n", err)
				}
			}
		}
	}

	return nil
}
