package aitools

import (
	"database/sql"
	_ "embed"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed write_file_tool_description.md
var writeFileToolDescription string

var WriteFileTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "write_file_tool",
		Description: writeFileToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"fileName": {
					Type:        "string",
					Description: "Concise file name that describes the contents of the file",
				},
				"fileContents": {
					Type:        "string",
					Description: "Text content that needs to be written to the file",
				},
			},
			Required: []string{"fileName", "fileContents"},
		},
	},
}

func ExecuteWriteFileTool(fileName string, fileContents string, email string, sessionId string, db *sql.DB) error {
	var newFile = models.ChatFile{
		FileId:       uuid.New().String(),
		FileName:     fileName,
		FileContents: fileContents,
		Email:        email,
		SessionId:    sessionId,
	}
	err := repository.InsertChatFile(db, newFile)
	if err != nil {
		return err
	}
	return nil
}
