package aitools

import (
	"database/sql"
	_ "embed"
	"fmt"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed read_file_tool_description.md
var readFileToolDescription string

var ReadFileTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "read_file_tool",
		Description: readFileToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"fileName": {
					Type:        "string",
					Description: "file name of the file you want to read",
				},
			},
			Required: []string{"fileName"},
		},
	},
}

func ExecuteReadFileTool(fileName string, email string, sessionId string, db *sql.DB) (*string, error) {
	files, err := repository.GetChatFilesByFileName(db, fileName, sessionId, email)
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("no files found")
	}
	return &files[0].FileContents, nil
}
