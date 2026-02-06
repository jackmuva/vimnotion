package aitools

import (
	"database/sql"
	_ "embed"
	"fmt"

	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed read_user_file_tool_description.md
var readUserContentToolDescription string

var ReadUserContentTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "read_user_content_tool",
		Description: readUserContentToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"fileId": {
					Type:        "string",
					Description: "Unique UUID of the file. This will be included in the user message if needed",
				},
			},
			Required: []string{"fileId"},
		},
	},
}

func ExecuteReadUserFileTool(fileId string, db *sql.DB) (*string, error) {
	files, err := repository.GetVnObjectById(db, fileId)
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("No file with fileid: %s", fileId)
	}
	return &files[0].Contents, nil
}
