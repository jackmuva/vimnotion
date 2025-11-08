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

func ConnectTurso() *sql.DB {
	cfg := config.Get()
	var urlBuffer strings.Builder
	urlBuffer.WriteString(cfg.TursoDatabaseUrl)
	urlBuffer.WriteString("?authToken=")
	urlBuffer.WriteString(cfg.TursoAuthToken)

	db, err := sql.Open("libsql", urlBuffer.String())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", urlBuffer.String(), err)
	}

	db.SetConnMaxIdleTime(9 * time.Second)

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS User (email TEXT PRIMARY KEY, name TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS DirectoryStructure(email TEXT PRIMARY KEY, structure TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}
	_, err = db.Exec("CREATE TABLE IF NOT EXISTS VnObject(id TEXT PRIMARY KEY, name TEXT, IsFile BOOLEAN, updateDate TEXT, contents TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}

	return db
}

func GetUser(db *sql.DB, email string) []models.User {
	rows, err := db.Query("SELECT * FROM User WHERE email=?", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		if err := rows.Scan(&user.Email, &user.Name); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		users = append(users, user)
		fmt.Println(user.Email, user.Name)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
	}
	return users
}

func GetDirectoryStructure(db *sql.DB, email string) []models.DirectoryStructure {
	rows, err := db.Query("SELECT * FROM DirectoryStructure WHERE email=?", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var directoryStructures []models.DirectoryStructure

	for rows.Next() {
		var directoryStructure models.DirectoryStructure

		if err := rows.Scan(&directoryStructure.Email, &directoryStructure.Structure); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		directoryStructures = append(directoryStructures, directoryStructure)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
	}
	return directoryStructures
}

func GetVnObjectById(db *sql.DB, id string) []models.VnObject {
	rows, err := db.Query("SELECT * FROM VnObject WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var vnObjects []models.VnObject

	for rows.Next() {
		var vnObject models.VnObject

		if err := rows.Scan(&vnObject.Id, &vnObject.Name, &vnObject.IsFile, &vnObject.Contents); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		vnObjects = append(vnObjects, vnObject)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
	}
	return vnObjects
}

func InsertUser(db *sql.DB, user models.User) {
	_, err := db.Exec("INSERT INTO User (email, name) VALUES(?, ?)", user.Email, user.Name)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func InsertDirectoryStructure(db *sql.DB, dirStruct models.DirectoryStructure) {
	_, err := db.Exec("INSERT INTO DirectoryStructure (email, structure) VALUES(?, ?)", dirStruct.Email, dirStruct.Structure)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func InsertVnObject(db *sql.DB, vnObject models.VnObject) {
	_, err := db.Exec("INSERT INTO VnObject (id, name, isFile, Contents, updateDate ) VALUES(?, ?, ?, ?, ?)",
		vnObject.Id, vnObject.Name, vnObject.IsFile, vnObject.Contents, vnObject.UpdateDate)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func UpdateDirectoryStructure(db *sql.DB, dirStruct models.DirectoryStructure) {
	_, err := db.Exec("UPDATE DirectoryStructure SET structure=? WHERE email=?",
		dirStruct.Structure, dirStruct.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
	}
}

func UpdateVnObject(db *sql.DB, vnObject models.VnObject) {
	_, err := db.Exec("UPDATE VnObject SET Name=?, Contents=?, updateDate=? WHERE id=?",
		vnObject.Name, vnObject.Contents, vnObject.Id, vnObject.UpdateDate)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
	}
}
