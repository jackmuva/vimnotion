package services

import (
	"database/sql"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

const MaxDbWorkers = 5

func GetDirectoryStructure(db *sql.DB, email string) (string, error) {
	directory, err := repository.GetDirectoryStructure(db, email)
	if err != nil {
		return "", fmt.Errorf("unable to get directory structure: %w", err)
	}
	if len(directory) == 0 {
		return "", fmt.Errorf("directory structure not found for user")
	}
	return directory[0].Structure, nil
}

func UpdateDirectoryStructure(db *sql.DB, email string, structure string, changes models.DirectoryChanges) error {
	err := repository.UpdateDirectoryStructure(db, models.DirectoryStructure{
		Email:     email,
		Structure: structure,
	})
	if err != nil {
		return fmt.Errorf("unable to update directory structure: %w", err)
	}

	if err := CreateAllVnObjects(db, changes.Created, email); err != nil {
		return fmt.Errorf("failed to create objects: %w", err)
	}

	if err := UpdateAllVnObjects(db, changes.Moved); err != nil {
		return fmt.Errorf("failed to update objects: %w", err)
	}

	if err := DeleteAllVnObjects(db, changes.Deleted); err != nil {
		return fmt.Errorf("failed to delete objects: %w", err)
	}

	return nil
}

func InitializeUserDirectory(db *sql.DB, email string, name string) error {
	rootId := uuid.New().String()
	trashId := uuid.New().String()

	var structureBuilder strings.Builder
	structureBuilder.WriteString("{\"")
	structureBuilder.WriteString(rootId)
	structureBuilder.WriteString("|root/\": {\"type\":\"DIRECTORY\",\"children\":{\"")
	structureBuilder.WriteString(trashId)
	structureBuilder.WriteString("|trash/\":{\"type\":\"DIRECTORY\",\"children\":{}}}}}")

	err := repository.InsertUser(db, models.User{Email: email, Name: name})
	if err != nil {
		return fmt.Errorf("unable to insert user: %w", err)
	}

	err = repository.InsertDirectoryStructure(db, models.DirectoryStructure{
		Email:     email,
		Structure: structureBuilder.String(),
	})
	if err != nil {
		return fmt.Errorf("unable to insert directory structure: %w", err)
	}

	err = repository.InsertVnObject(db, models.VnObject{
		Id:         rootId,
		Name:       "root",
		Email:      email,
		IsFile:     false,
		Contents:   "",
		UpdateDate: time.Now().UTC().String(),
	})
	if err != nil {
		return fmt.Errorf("unable to insert root vnobject: %w", err)
	}

	err = repository.InsertVnObject(db, models.VnObject{
		Id:         trashId,
		Name:       "trash",
		Email:      email,
		IsFile:     false,
		Contents:   "",
		UpdateDate: time.Now().UTC().String(),
	})
	if err != nil {
		return fmt.Errorf("unable to insert trash vnobject: %w", err)
	}

	return nil
}

func CreateAllVnObjects(db *sql.DB, createdObjects []models.CreatedObjects, email string) error {
	workerSem := make(chan struct{}, MaxDbWorkers)
	var workerWg sync.WaitGroup
	var errMutex sync.Mutex
	var errors []error

	for _, created := range createdObjects {
		workerWg.Add(1)
		go func(created models.CreatedObjects, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			err := repository.InsertVnObject(db, models.VnObject{
				Id:         created.Uuid,
				Name:       created.Name,
				Email:      email,
				IsFile:     created.IsFile,
				Contents:   "",
				UpdateDate: time.Now().Format(time.RFC3339),
				Public:     false,
			})
			if err != nil {
				errMutex.Lock()
				errors = append(errors, err)
				errMutex.Unlock()
			}
		}(created, db)
	}
	workerWg.Wait()

	if len(errors) > 0 {
		return fmt.Errorf("failed to create %d objects: %v", len(errors), errors[0])
	}
	return nil
}

func UpdateAllVnObjects(db *sql.DB, movedObjects []models.MovedObjects) error {
	workerSem := make(chan struct{}, MaxDbWorkers)
	var workerWg sync.WaitGroup
	var errMutex sync.Mutex
	var errors []error

	for _, obj := range movedObjects {
		workerWg.Add(1)
		go func(obj models.MovedObjects, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			err := repository.UpdateVnObjectLocation(db, obj.Uuid, obj.Name, obj.IsFile, time.Now().Format(time.RFC3339))
			if err != nil {
				errMutex.Lock()
				errors = append(errors, err)
				errMutex.Unlock()
			}
		}(obj, db)
	}
	workerWg.Wait()

	if len(errors) > 0 {
		return fmt.Errorf("failed to update %d objects: %v", len(errors), errors[0])
	}
	return nil
}

func DeleteAllVnObjects(db *sql.DB, delObjects []models.DeletedObjects) error {
	workerSem := make(chan struct{}, MaxDbWorkers)
	var workerWg sync.WaitGroup
	var errMutex sync.Mutex
	var errors []error

	var imageRefsMutex sync.Mutex
	var allImageRefs []models.ImageReference

	for _, obj := range delObjects {
		workerWg.Add(1)
		go func(obj models.DeletedObjects, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			imageRefs, err := repository.GetImageReferenceByVnObject(db, obj.Uuid)
			if err != nil {
				fmt.Printf("unable to get image references for %s: %s\n", obj.Uuid, err)
			} else {
				imageRefsMutex.Lock()
				allImageRefs = append(allImageRefs, imageRefs...)
				imageRefsMutex.Unlock()
			}

			err = repository.DeleteVnObject(db, obj.Uuid)
			if err != nil {
				errMutex.Lock()
				errors = append(errors, err)
				errMutex.Unlock()
			}
		}(obj, db)
	}
	workerWg.Wait()

	imageIdsToCheck := make(map[string]bool)
	for _, ref := range allImageRefs {
		imageIdsToCheck[ref.ImageId] = true
	}

	for imageId := range imageIdsToCheck {
		workerWg.Add(1)
		go func(imageId string) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			count, err := repository.GetImageReferenceCount(db, imageId)
			if err != nil {
				fmt.Printf("unable to get image reference count for %s: %s\n", imageId, err)
				return
			}
			if count.Count == 0 {
				err = repository.DeleteImage(db, imageId)
				if err != nil {
					fmt.Printf("unable to delete orphaned image %s: %s\n", imageId, err)
				}
			}
		}(imageId)
	}
	workerWg.Wait()

	if len(errors) > 0 {
		return fmt.Errorf("failed to delete %d objects: %v", len(errors), errors[0])
	}
	return nil
}
