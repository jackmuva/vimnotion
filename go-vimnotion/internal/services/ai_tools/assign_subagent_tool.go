package aitools

import (
	"database/sql"
	_ "embed"

	"vimnotion.com/server/internal/models"
)

//go:embed assign_subagent_tool_description.md
var assignSubagentDescription string

var AssignSubagentTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "assign_subagent_tool",
		Description: assignSubagentDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"task": {
					Type:        "string",
					Description: "Short task description",
				},
				"subagentPrompt": {
					Type:        "string",
					Description: "Concise prompt with all necessary context to complete the subagent's task",
				},
			},
			Required: []string{"task", "subagentPrompt"},
		},
	},
}

func ExecuteAssignSubagentTool(task string, subagentPrompt string, email string, sessionId string, db *sql.DB) error {

	return nil
}
