package aitools

import (
	"database/sql"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

var WriteFileTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name: "write_file_tool",
		Description: "Use this tool to write long text contents to a files that can later be accessed by listing files and reading files." +
			"## When to use this tool:\n",
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
	repository.InsertChatFile(db, newFile)
	return nil
}
