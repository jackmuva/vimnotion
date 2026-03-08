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
				"fileId": {
					Type:        "string",
					Description: "file ID of the file you want to read",
				},
			},
			Required: []string{"fileId"},
		},
	},
}

func ExecuteReadFileTool(fileId string, email string, sessionId string, db *sql.DB) (*string, error) {
	chatFiles, err := repository.GetChatFilesById(db, fileId, sessionId, email)
	if err != nil {
		return nil, err
	}
	if len(chatFiles) == 0 {
		vnFiles, err := repository.GetVnObjectById(db, fileId)
		if err != nil {
			return nil, err
		}
		if len(vnFiles) == 0 {
			return nil, fmt.Errorf("no files found")
		}
		return &vnFiles[0].Contents, nil
	} else {
		return &chatFiles[0].FileContents, nil
	}
}

func AppendLineNumber(contents string) string {

}
