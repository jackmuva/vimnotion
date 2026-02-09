package aitools

import (
	_ "embed"

	"vimnotion.com/server/internal/models"
)

//go:embed suggest_tool_description.md
var suggestToolDescription string

var SuggestTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "suggest_tool",
		Description: suggestToolDescription,
	},
}

func ExecuteSuggestTool() {

}
