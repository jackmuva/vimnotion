package turso

import (
	"database/sql"
	"fmt"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"os"
	"strings"
	"time"
	"vimnotion.com/server/utils"
)

func ConnectTurso() *sql.DB {
	var urlBuffer strings.Builder
	urlBuffer.WriteString(utils.GetEnv().TursoDatabaseUrl)
	urlBuffer.WriteString("?")
	urlBuffer.WriteString(utils.GetEnv().TursoAuthToken)

	db, err := sql.Open("libsql", urlBuffer.String())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", urlBuffer.String(), err)
		os.Exit(1)
	}
	defer db.Close()

	db.SetConnMaxIdleTime(9 * time.Second)

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS Users (email TEXT PRIMARY KEY, name TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS DirectoryStructure(email TEXT PRIMARY KEY, structure TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}
	_, err = db.Exec("CREATE TABLE IF NOT EXISTS VnObjects(id TEXT PRIMARY KEY, name TEXT, IsFile BOOLEAN)")
	if err != nil {
		fmt.Printf("error creating table: %s", err)
	}

	return db
}

type User struct {
	Email string
	Name  string
}

type DirectoryStructure struct {
	Email     string
	Structure string
}

type VnObject struct {
	Id       string
	Name     string
	IsFile   bool
	Contents string
}

func GetUser(db *sql.DB, email string) []User {
	rows, err := db.Query("SELECT * FROM Users WHERE email='?'", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		os.Exit(1)
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var user User

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

func GetDirectoryStructure(db *sql.DB, email string) []DirectoryStructure {
	rows, err := db.Query("SELECT * FROM DirectoryStructure WHERE email='?'", email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		os.Exit(1)
	}
	defer rows.Close()

	var directoryStructures []DirectoryStructure

	for rows.Next() {
		var directoryStructure DirectoryStructure

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

func GetVnObjectById(db *sql.DB, id string) []VnObject {
	rows, err := db.Query("SELECT * FROM VnObjects WHERE id='?'", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var vnObjects []VnObject

	for rows.Next() {
		var vnObject VnObject

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

func InsertUser(db *sql.DB, user User) {
	_, err := db.Exec("INSERT INTO User (email, name) VALUES(?, ?)", user.Email, user.Name)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func InsertDirectoryStructure(db *sql.DB, dirStruct DirectoryStructure) {
	_, err := db.Exec("INSERT INTO DirectoryStructure (email, structure) VALUES(?, ?)", dirStruct.Email, dirStruct.Structure)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func InsertVnObject(db *sql.DB, vnObject VnObject) {
	_, err := db.Exec("INSERT INTO VnObject (id, name, isFile, Contents ) VALUES(?, ?)",
		vnObject.Id, vnObject.Name, vnObject.IsFile, vnObject.Contents)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
	}
}

func UpdateDirectoryStructure(db *sql.DB, dirStruct DirectoryStructure) {
	_, err := db.Exec("UPDATE DirectoryStructure SET structure=? WHERE email=?",
		dirStruct.Structure, dirStruct.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
	}
}

func UpdateVnObject(db *sql.DB, vnObject VnObject) {
	_, err := db.Exec("UPDATE VnObject SET Name=?, Contents=? WHERE id=?",
		vnObject.Name, vnObject.Contents, vnObject.Id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute update: %v\n", err)
	}
}
