package aitools

import (
	"database/sql"
	_ "embed"
	"fmt"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed list_file_tool_description.md
var listFileToolDescription string

var ListFilesTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "list_files_tool",
		Description: listFileToolDescription,
		Parameters: models.AiFunctionParams{
			Type:       "object",
			Properties: map[string]models.AiFunctionProperties{},
			Required:   []string{},
		},
	},
}

func ExecuteListFilesTool(email string, sessionId string, db *sql.DB) ([]string, error) {
	files, err := repository.GetChatFilesBySessionId(db, sessionId, email)
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("no files found")
	}
	var fileNames []string
	for _, file := range files {
		fileNames = append(fileNames, file.FileName)
	}
	return fileNames, nil
}
