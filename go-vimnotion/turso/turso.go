package turso

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
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

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS test (email TEXT PRIMARY KEY, name TEXT)")
	if err != nil {
		fmt.Printf("error creating table: %w", err)
	}
	return db
}

type User struct {
	Email string
	Name  string
}

func QueryUsers(db *sql.DB) {
	rows, err := db.Query("SELECT * FROM users")
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
			return
		}

		users = append(users, user)
		fmt.Println(user.Email, user.Name)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
	}
}
