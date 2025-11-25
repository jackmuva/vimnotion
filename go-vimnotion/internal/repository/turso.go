package repository

import (
	"database/sql"
	"fmt"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"os"
	"strings"
	"time"
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
	_, err = db.Exec("CREATE TABLE IF NOT EXISTS VnObject(id TEXT PRIMARY KEY, name TEXT, IsFile BOOLEAN, updateDate TEXT, contents TEXT, public BOOLEAN)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
		return nil, err
	}
	_, err = db.Exec("CREATE TABLE IF NOT EXISTS Image(id TEXT PRIMARY KEY, email TEXT, contentType TEXT, binaryData BLOB)")
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

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.UpdateDate, &vnObject.Contents, &vnObject.Public); err != nil {
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

func GetPublicVnObjectById(db *sql.DB, id string) ([]models.VnObject, error) {
	rows, err := db.Query("SELECT * FROM VnObject WHERE id=? AND public=1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var vnObjects []models.VnObject

	for rows.Next() {
		var vnObject models.VnObject

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.UpdateDate, &vnObject.Contents, &vnObject.Public); err != nil {
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
	_, err := db.Exec("INSERT INTO VnObject (id, name, isFile, contents, updateDate, public) VALUES(?, ?, ?, ?, ?, ?)",
		vnObject.Id, vnObject.Name, vnObject.IsFile, vnObject.Contents, vnObject.UpdateDate, vnObject.Public)
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
	_, err := db.Exec("UPDATE VnObject SET Name=?, Contents=?, updateDate=?, public=? WHERE id=?",
		vnObject.Name, vnObject.Contents, vnObject.UpdateDate, vnObject.Public, vnObject.Id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
		return err
	}
	return nil
}

func UpdateVnObjectLocation(db *sql.DB, id string, name string, isFile bool, dt string) error {
	_, err := db.Exec("UPDATE VnObject SET Name=?, isFile=? dt=? WHERE id=?",
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
