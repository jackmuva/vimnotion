package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
)

func ConnectTurso() (*sql.DB, error) {
	cfg := config.Get()
	var urlBuffer strings.Builder
	urlBuffer.WriteString(cfg.TursoDatabaseUrl)
	urlBuffer.WriteString("?authToken=")
	urlBuffer.WriteString(cfg.TursoAuthToken)

	db, err := sql.Open("libsql", urlBuffer.String())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", urlBuffer.String(), err)
		return nil, err
	}

	db.SetConnMaxIdleTime(9 * time.Second)

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS User (email TEXT PRIMARY KEY, name TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS DirectoryStructure(email TEXT PRIMARY KEY, structure TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS VnObject(id TEXT PRIMARY KEY, name TEXT, IsFile BOOLEAN, updateDate TEXT, contents TEXT, public BOOLEAN, email TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS Image(id TEXT PRIMARY KEY, email TEXT, contentType TEXT, binaryData BLOB)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS ImageReference(" +
		"imageId TEXT NOT NULL, " +
		"vnObjectId TEXT NOT NULL, " +
		"PRIMARY KEY(imageId, vnObjectId), " +
		"FOREIGN KEY(imageId) REFERENCES Image(id) ON DELETE CASCADE, " +
		"FOREIGN KEY(vnObjectId) REFERENCES VnObject(id) ON DELETE CASCADE" +
		")")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS ChatSession(" +
		"sessionId TEXT PRIMARY KEY, " +
		"summary TEXT, " +
		"messages TEXT, " +
		"updateDate TEXT, " +
		"email TEXT, " +
		"FOREIGN KEY(email) REFERENCES User(email) ON DELETE CASCADE" +
		")")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS ChatFiles(" +
		"fileId TEXT PRIMARY KEY, " +
		"fileName TEXT NOT NULL, " +
		"fileContents TEXT, " +
		"email TEXT, " +
		"sessionId TEXT, " +
		"FOREIGN KEY(email) REFERENCES User(email) ON DELETE CASCADE, " +
		"FOREIGN KEY(sessionId) REFERENCES ChatSession(sessionId) ON DELETE CASCADE " +
		")")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}

	return db, nil
}

func GetUser(db *sql.DB, email string) ([]models.User, error) {
	rows, err := db.Query("SELECT * FROM User WHERE email=?", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		if err := rows.Scan(&user.Email, &user.Name); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		users = append(users, user)
		fmt.Println(user.Email, user.Name)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return users, nil
}

func GetDirectoryStructure(db *sql.DB, email string) ([]models.DirectoryStructure, error) {
	rows, err := db.Query("SELECT * FROM DirectoryStructure WHERE email=?", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var directoryStructures []models.DirectoryStructure

	for rows.Next() {
		var directoryStructure models.DirectoryStructure

		if err := rows.Scan(&directoryStructure.Email, &directoryStructure.Structure); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		directoryStructures = append(directoryStructures, directoryStructure)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return directoryStructures, nil
}

func GetVnObjectById(db *sql.DB, id string) ([]models.VnObject, error) {
	rows, err := db.Query("SELECT * FROM VnObject WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var vnObjects []models.VnObject

	for rows.Next() {
		var vnObject models.VnObject

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.UpdateDate, &vnObject.Contents, &vnObject.Public, &vnObject.Email); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		vnObjects = append(vnObjects, vnObject)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return vnObjects, nil
}

func SearchVnObjectByContent(db *sql.DB, search string, email string) ([]models.VnObject, error) {
	rows, err := db.Query("SELECT * FROM VnObject WHERE email=? AND isFile=1 AND contents LIKE ? LIMIT 100", email, "%"+search+"%")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var vnObjects []models.VnObject

	for rows.Next() {
		var vnObject models.VnObject

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.UpdateDate, &vnObject.Contents, &vnObject.Public, &vnObject.Email); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		vnObjects = append(vnObjects, vnObject)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return vnObjects, nil
}

func GetPublicVnObjectById(db *sql.DB, id string) ([]models.VnObject, error) {
	rows, err := db.Query("SELECT * FROM VnObject WHERE id=? AND public=1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var vnObjects []models.VnObject

	for rows.Next() {
		var vnObject models.VnObject

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.UpdateDate, &vnObject.Contents, &vnObject.Public, &vnObject.Email); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		vnObjects = append(vnObjects, vnObject)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return vnObjects, nil
}

func GetImageById(db *sql.DB, id string) ([]models.Image, error) {
	rows, err := db.Query("SELECT * FROM Image WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var images []models.Image

	for rows.Next() {
		var image models.Image
		if err := rows.Scan(&image.Id, &image.Email, &image.ContentType, &image.BinaryData); err != nil {
			fmt.Println("Error scanning row:", err)
		}
		images = append(images, image)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return images, nil
}
func InsertUser(db *sql.DB, user models.User) error {
	_, err := db.Exec("INSERT INTO User (email, name) VALUES(?, ?)", user.Email, user.Name)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func InsertDirectoryStructure(db *sql.DB, dirStruct models.DirectoryStructure) error {
	_, err := db.Exec("INSERT INTO DirectoryStructure (email, structure) VALUES(?, ?)", dirStruct.Email, dirStruct.Structure)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func InsertVnObject(db *sql.DB, vnObject models.VnObject) error {
	_, err := db.Exec("INSERT INTO VnObject (id, name, email, isFile, contents, updateDate, public) VALUES(?, ?, ?, ?, ?, ?, ?)",
		vnObject.Id, vnObject.Name, vnObject.Email, vnObject.IsFile, vnObject.Contents, vnObject.UpdateDate, vnObject.Public)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func InsertImage(db *sql.DB, image models.Image) error {
	_, err := db.Exec("INSERT INTO Image(id, email, contentType, binaryData) VALUES(?, ?, ?, ? )",
		image.Id, image.Email, image.ContentType, image.BinaryData)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func UpdateDirectoryStructure(db *sql.DB, dirStruct models.DirectoryStructure) error {
	_, err := db.Exec("UPDATE DirectoryStructure SET structure=? WHERE email=?",
		dirStruct.Structure, dirStruct.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func UpdateVnObject(db *sql.DB, vnObject models.VnObject) error {
	_, err := db.Exec("UPDATE VnObject SET Name=?, Email=?, Contents=?, updateDate=?, public=? WHERE id=?",
		vnObject.Name, vnObject.Email, vnObject.Contents, vnObject.UpdateDate, vnObject.Public, vnObject.Id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func UpdateVnObjectLocation(db *sql.DB, id string, name string, isFile bool, dt string) error {
	_, err := db.Exec("UPDATE VnObject SET Name=?, isFile=?, updateDate=? WHERE id=?",
		name, isFile, dt, id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func DeleteVnObject(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM VnObject WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func DeleteImage(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM Image WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func InsertImageReference(db *sql.DB, imageId string, objectId string) error {
	_, err := db.Exec("INSERT INTO ImageReference(imageId, vnObjectId) VALUES(?, ?)", imageId, objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func DeleteImageReference(db *sql.DB, imageId string, objectId string) error {
	_, err := db.Exec("DELETE FROM ImageReference WHERE imageId=? AND vnObjectId=?", imageId, objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func GetImageReferenceByVnObject(db *sql.DB, objectId string) ([]models.ImageReference, error) {
	rows, err := db.Query("SELECT * FROM ImageReference WHERE vnObjectId=?", objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var imageReferences []models.ImageReference

	for rows.Next() {
		var imageReference models.ImageReference

		if err := rows.Scan(&imageReference.ImageId, &imageReference.VnObjectId); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		imageReferences = append(imageReferences, imageReference)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return imageReferences, nil
}

func GetImageReferenceCount(db *sql.DB, imageId string) (*struct{ Count int }, error) {
	rows, err := db.Query("SELECT COUNT(*) as Count FROM ImageReference WHERE imageId=?", imageId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var countRows []struct{ Count int }

	for rows.Next() {
		var countRow struct{ Count int }

		if err := rows.Scan(&countRow.Count); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		countRows = append(countRows, countRow)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	if len(countRows) == 0 {
		fmt.Println("Error: No count available")
		return nil, fmt.Errorf("Error: No count available")
	}
	return &countRows[0], nil
}

func InsertChatSession(db *sql.DB, chatSession models.ChatSession) error {
	fmt.Printf("DEBUG InsertChatSession - Messages: %+v\n", chatSession.Messages)
	fmt.Printf("DEBUG InsertChatSession - Messages length: %d\n", len(chatSession.Messages))
	jsonString, err := json.Marshal(chatSession.Messages)
	if err != nil {
		return err
	}
	fmt.Printf("DEBUG InsertChatSession - JSON: %s\n", string(jsonString))
	_, err = db.Exec("INSERT INTO ChatSession(sessionId, summary, messages, updateDate, email) VALUES(?, ?, ?, ?, ?)",
		chatSession.SessionId, chatSession.Summary, jsonString, chatSession.UpdateDate, chatSession.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func UpdateChatSession(db *sql.DB, chatSession models.ChatSession) error {
	jsonString, err := json.Marshal(chatSession.Messages)
	if err != nil {
		return err
	}

	_, err = db.Exec("UPDATE ChatSession SET messages=?, updateDate=?, summary=? WHERE sessionId=? AND email=?",
		jsonString, chatSession.UpdateDate, chatSession.Summary, chatSession.SessionId, chatSession.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func DeleteChatSession(db *sql.DB, chatSession models.ChatSession) error {
	_, err := db.Exec("DELETE FROM ChatSession WHERE sessionId=? AND email=?",
		chatSession.SessionId, chatSession.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func GetChatSessionsByEmail(db *sql.DB, email string) ([]models.ChatSession, error) {
	rows, err := db.Query("SELECT * FROM ChatSession WHERE email=? LIMIT 50", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var sessions []models.ChatSession

	for rows.Next() {
		var session models.ChatSession
		var messagesJSON string

		if err := rows.Scan(&session.SessionId, &session.Summary, &messagesJSON, &session.UpdateDate, &session.Email); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		if err := json.Unmarshal([]byte(messagesJSON), &session.Messages); err != nil {
			fmt.Printf("Error unmarshaling messages: %v\n", err)
			return nil, err
		}

		sessions = append(sessions, session)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return sessions, nil
}

func GetChatSessionsBySessionIdAndEmail(db *sql.DB, sessionId string, email string) ([]models.ChatSession, error) {
	rows, err := db.Query("SELECT * FROM ChatSession WHERE email=? AND sessionId=? LIMIT 1", email, sessionId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var sessions []models.ChatSession

	for rows.Next() {
		var session models.ChatSession
		var messagesJSON string

		if err := rows.Scan(&session.SessionId, &session.Summary, &messagesJSON, &session.UpdateDate, &session.Email); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		if err := json.Unmarshal([]byte(messagesJSON), &session.Messages); err != nil {
			fmt.Printf("Error unmarshaling messages: %v\n", err)
			return nil, err
		}

		sessions = append(sessions, session)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return sessions, nil
}

func InsertChatFile(db *sql.DB, chatFile models.ChatFile) error {
	_, err := db.Exec("INSERT INTO ChatFiles(fileId, fileName, fileContents, email, sessionId) VALUES(?, ?, ?, ?, ?)",
		chatFile.FileId, chatFile.FileName, chatFile.FileContents, chatFile.Email, chatFile.SessionId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func UpdateChatFile(db *sql.DB, chatFile models.ChatFile) error {
	_, err := db.Exec("UPDATE ChatFiles SET fileName=?, fileContents=? WHERE fileId=? AND email=? AND sessionId=?",
		chatFile.FileName, chatFile.FileContents, chatFile.FileId, chatFile.Email, chatFile.SessionId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func DeleteChatFilesBySessionId(db *sql.DB, sessionId string) error {
	_, err := db.Exec("DELETE FROM ChatFiles WHERE sessionId=?", sessionId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func GetChatFilesBySessionId(db *sql.DB, sessionId string, email string) ([]models.ChatFile, error) {
	rows, err := db.Query("SELECT fileId, fileName, fileContents, email, sessionId FROM ChatFiles WHERE sessionId=? AND email=?", sessionId, email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var chatFiles []models.ChatFile

	for rows.Next() {
		var chatFile models.ChatFile

		if err := rows.Scan(&chatFile.FileId, &chatFile.FileName, &chatFile.FileContents, &chatFile.Email, &chatFile.SessionId); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		chatFiles = append(chatFiles, chatFile)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return chatFiles, nil
}
