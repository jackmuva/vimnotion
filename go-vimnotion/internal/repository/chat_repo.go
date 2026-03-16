package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"

	"vimnotion.com/server/internal/models"
)

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

func InsertChatSession(db *sql.DB, chatSession models.ChatSession) error {
	jsonString, err := json.Marshal(chatSession.Messages)
	if err != nil {
		return err
	}
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

func GetChatFilesById(db *sql.DB, fileId string, sessionId string, email string) ([]models.ChatFile, error) {
	rows, err := db.Query("SELECT fileId, fileName, fileContents, email, sessionId FROM ChatFiles WHERE sessionId=? AND email=? AND fileId=?", sessionId, email, fileId)
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

func GetSuggestionsByVnObjectId(db *sql.DB, vnObjectId string) ([]models.Suggestion, error) {
	rows, err := db.Query("SELECT id, vnObjectId, email, startLine, EndLine, oldString, newString, explanation FROM Suggestion WHERE vnObjectId=?", vnObjectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var suggestions []models.Suggestion

	for rows.Next() {
		var suggestion models.Suggestion
		if err := rows.Scan(&suggestion.Id, &suggestion.VnObjectId, &suggestion.Email, &suggestion.StartLine, &suggestion.EndLine, &suggestion.OldString, &suggestion.NewString, &suggestion.Explanation); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}
		suggestions = append(suggestions, suggestion)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}

	return suggestions, nil
}

func InsertSuggestion(db *sql.DB, suggestion models.Suggestion) error {
	_, err := db.Exec("INSERT INTO Suggestion(id, vnObjectId, startLine, EndLine, oldString, newString, explanation, email) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
		suggestion.Id, suggestion.VnObjectId, suggestion.StartLine, suggestion.EndLine, suggestion.OldString, suggestion.NewString, suggestion.Explanation, suggestion.Email)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func BatchInsertSuggestions(db *sql.DB, suggestions []models.Suggestion) error {
	if len(suggestions) == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to begin transaction: %v\n", err)
		return err
	}

	stmt, err := tx.Prepare("INSERT INTO Suggestion(id, vnObjectId, startLine, EndLine, oldString, newString, explanation, email) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		_ = tx.Rollback()
		fmt.Fprintf(os.Stderr, "failed to prepare batch insert: %v\n", err)
		return err
	}
	defer stmt.Close()

	for _, suggestion := range suggestions {
		_, err = stmt.Exec(
			suggestion.Id,
			suggestion.VnObjectId,
			suggestion.StartLine,
			suggestion.EndLine,
			suggestion.OldString,
			suggestion.NewString,
			suggestion.Explanation,
			suggestion.Email,
		)
		if err != nil {
			_ = tx.Rollback()
			fmt.Fprintf(os.Stderr, "failed to execute batch insert: %v\n", err)
			return err
		}
	}

	if err = tx.Commit(); err != nil {
		fmt.Fprintf(os.Stderr, "failed to commit transaction: %v\n", err)
		return err
	}

	return nil
}

func DeleteSuggestionById(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM Suggestion WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func DeleteSuggestionsByVnObjectId(db *sql.DB, vnObjectId string) error {
	_, err := db.Exec("DELETE FROM Suggestion WHERE vnObjectId=?", vnObjectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}
