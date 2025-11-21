package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
	"vimnotion.com/server/internal/services"
)

func HandlePersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			GetPersonalDirectory(db)(w, r)
		case http.MethodPut:
			UpdatePersonalDirectory(db)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func GetPersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			message := "need to auth"
			response := models.DataResponse{Message: &message, StatusCode: 400}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		token, err := services.VerifyJwt(tokenCookie.Value)
		if err != nil {
			message := "invalid token"
			response := models.DataResponse{Message: &message, StatusCode: 401}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		email := claims["email"]
		directory, err := repository.GetDirectoryStructure(db, email.(string))
		if err != nil {
			fmt.Printf("Unable to Get data from db: %s\n", err)
			response := models.DataResponse{StatusCode: 500}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to marshal: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
		}
		data := directory[0].Structure
		response := models.DataResponse{StatusCode: 200, Data: &data}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}

func UpdatePersonalDirectory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			message := "need to auth"
			response := models.DataResponse{Message: &message, StatusCode: 400}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		token, err := services.VerifyJwt(tokenCookie.Value)
		if err != nil {
			message := "invalid token"
			response := models.DataResponse{Message: &message, StatusCode: 401}
			jsonMessage, err := json.Marshal(response)
			if err != nil {
				fmt.Printf("unable to write error json: %s\n", err)
			}
			http.Error(w, string(jsonMessage), http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		email := claims["email"]

		var payload struct {
			Structure string
			Changes   models.DirectoryChanges
		}
		err = json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Unable to read body", http.StatusBadRequest)
			fmt.Printf("unable to read body: %s\n", err)
			return
		}

		repository.UpdateDirectoryStructure(db, models.DirectoryStructure{
			Email:     email.(string),
			Structure: payload.Structure,
		})
		fmt.Printf("payload: %+v\n", payload)

		err = CreateAllVnObjects(db, payload.Changes.Created)
		if err != nil {
			message := fmt.Sprintf("failed to create objects: %s", err.Error())
			response := models.DataResponse{Message: &message, StatusCode: 500}
			jsonMessage, marshalErr := json.Marshal(response)
			if marshalErr != nil {
				fmt.Printf("unable to write error json: %s\n", marshalErr)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}
		err = UpdateAllVnObjects(db, payload.Changes.Moved)
		if err != nil {
			message := fmt.Sprintf("failed to update objects: %s", err.Error())
			response := models.DataResponse{Message: &message, StatusCode: 500}
			jsonMessage, marshalErr := json.Marshal(response)
			if marshalErr != nil {
				fmt.Printf("unable to write error json: %s\n", marshalErr)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}
		err = DeleteAllVnObjects(db, payload.Changes.Deleted)
		if err != nil {
			message := fmt.Sprintf("failed to delete objects: %s", err.Error())
			response := models.DataResponse{Message: &message, StatusCode: 500}
			jsonMessage, marshalErr := json.Marshal(response)
			if marshalErr != nil {
				fmt.Printf("unable to write error json: %s\n", marshalErr)
			}
			http.Error(w, string(jsonMessage), http.StatusInternalServerError)
			return
		}

		response := models.DataResponse{StatusCode: 200}
		jsonMessage, err := json.Marshal(response)
		if err != nil {
			fmt.Printf("unable to write error json: %s\n", err)
		}
		w.Write(jsonMessage)
	}
}

func CreateAllVnObjects(db *sql.DB, createdObjects []models.CreatedObjects) error {
	const maxDbWorkers = 5
	workerSem := make(chan struct{}, maxDbWorkers)
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
				IsFile:     created.IsFile,
				Contents:   "",
				UpdateDate: time.Now().Format(time.RFC3339),
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
	const maxDbWorkers = 5
	workerSem := make(chan struct{}, maxDbWorkers)
	var workerWg sync.WaitGroup
	var errMutex sync.Mutex
	var errors []error

	for _, obj := range movedObjects {
		workerWg.Add(1)
		go func(obj models.MovedObjects, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			err := repository.UpdateVnObject(db, models.VnObject{
				Id:         obj.Uuid,
				Name:       obj.Name,
				IsFile:     obj.IsFile,
				Contents:   *obj.Contents,
				UpdateDate: time.Now().Format(time.RFC3339),
			})
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
	const maxDbWorkers = 5
	workerSem := make(chan struct{}, maxDbWorkers)
	var workerWg sync.WaitGroup
	var errMutex sync.Mutex
	var errors []error

	for _, obj := range delObjects {
		workerWg.Add(1)
		go func(obj models.DeletedObjects, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			err := repository.DeleteVnObject(db, obj.Uuid)
			if err != nil {
				errMutex.Lock()
				errors = append(errors, err)
				errMutex.Unlock()
			}
		}(obj, db)
	}
	workerWg.Wait()

	if len(errors) > 0 {
		return fmt.Errorf("failed to delete %d objects: %v", len(errors), errors[0])
	}
	return nil
}
