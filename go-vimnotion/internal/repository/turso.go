package repository

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"vimnotion.com/server/internal/config"
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

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS Suggestion(" +
		"id TEXT PRIMARY KEY, " +
		"vnObjectId TEXT NOT NULL, " +
		"startLine INTEGER NOT NULL, " +
		"EndLine INTEGER NOT NULL, " +
		"oldString TEXT NOT NULL, " +
		"newString TEXT NOT NULL, " +
		"explanation TEXT NOT NULL, " +
		"email TEXT, " +
		"FOREIGN KEY(email) REFERENCES User(email) ON DELETE CASCADE, " +
		"FOREIGN KEY(vnObjectId) REFERENCES VnObject(id) ON DELETE CASCADE " +
		")")
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
		"tokens INTEGER, " +
		"mainSession BOOLEAN, " +
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
