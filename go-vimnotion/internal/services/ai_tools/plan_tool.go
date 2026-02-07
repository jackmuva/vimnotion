package aitools

import (
	"database/sql"
	_ "embed"
	"strings"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed plan_tool_description.md
var planToolDescription string

var PlanTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "plan_tool",
		Description: planToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"planName": {
					Type:        "string",
					Description: "Concise name that describes the overall plan",
				},
				"subtasks": {
					Type:        "array",
					Description: "List of subtasks in the plan",
					Items: &struct {
						Type string `json:"type"`
					}{
						Type: "string",
					},
				},
			},
			Required: []string{"subtasks"},
		},
	},
}

func ExecutePlanTool(planName string, todos []string, email string, sessionId string, db *sql.DB) (*string, error) {
	var planContents strings.Builder
	for _, todo := range todos {
		planContents.WriteString("- [ ] ")
		planContents.WriteString(todo)
		planContents.WriteString("\n")
	}
	planString := planContents.String()
	var planFile = models.ChatFile{
		FileId:       uuid.New().String(),
		FileName:     planName,
		FileContents: planString,
		Email:        email,
		SessionId:    sessionId,
	}
	err := repository.InsertChatFile(db, planFile)
	if err != nil {
		return nil, err
	}
	return &planString, nil
}
