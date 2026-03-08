package aitools

import (
	"database/sql"
	_ "embed"
	"fmt"
	"strings"

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
		contentsWithLines := AppendLineNumber(vnFiles[0].Contents)
		return &contentsWithLines, nil
	} else {
		contentsWithLines := AppendLineNumber(chatFiles[0].FileContents)
		return &contentsWithLines, nil
	}
}

func AppendLineNumber(contents string) string {
	lines := strings.Split(contents, "\n")
	var result []string
	for i, line := range lines {
		if len(line) > 0 {
			result = append(result, fmt.Sprintf("%d %s", i+1, line))
		}
	}
	return strings.Join(result, "\n")
}
