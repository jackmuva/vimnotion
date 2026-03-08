package aitools

import (
	"database/sql"
	_ "embed"
	"fmt"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed suggest_tool_description.md
var suggestToolDescription string

var SuggestTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "suggest_tool",
		Description: suggestToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"vnObjectId": {
					Type:        "string",
					Description: "The user message will have a vnObjectId represent the id of the file they provided",
				},
				"startLine": {
					Type:        "integer",
					Description: "Starting line number of the edit",
				},
				"endLine": {
					Type:        "integer",
					Description: "Ending line number of the edit",
				},
				"oldString": {
					Type:        "string",
					Description: "existing text to replace",
				},
				"newString": {
					Type:        "string",
					Description: "new text to insert",
				},
				"explanation": {
					Type:        "string",
					Description: "Explanation for the suggested edit",
				},
			},
			Required: []string{"vnObjectId", "startLine", "endLine", "oldString", "newString", "explanation"},
		},
	},
}

func ExecuteSuggestTool(vnObjectId string, startLine int, endLine int, oldString string, newString string, explanation string, email string, db *sql.DB) error {
	var suggestion = models.Suggestion{
		Id:          uuid.New().String(),
		Email:       email,
		VnObjectId:  vnObjectId,
		StartLine:   startLine,
		EndLine:     endLine,
		OldString:   oldString,
		NewString:   newString,
		Explanation: explanation,
	}
	err := repository.InsertSuggestion(db, suggestion)
	if err != nil {
		return fmt.Errorf("Unable to insert suggestion")
	}
	return nil
}
