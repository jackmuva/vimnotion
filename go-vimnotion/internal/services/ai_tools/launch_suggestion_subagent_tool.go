package aitools

import (
	"bufio"
	"bytes"
	"database/sql"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed launch_suggestion_subagent_tool_description.md
var suggestToolDescription string

var SuggestTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "suggest_tool",
		Description: suggestToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"suggestions": {
					Type:        "string",
					Description: "All edits suggested to a user's file",
				},
				"fileName": {
					Type:        "string",
					Description: "If suggestions are in a file, include the filename",
				},
			},
			Required: []string{},
		},
	},
}

func ExecuteSuggestTool(suggestions *string, fileName *string, email string, sessionId string, db *sql.DB) ([]models.Suggestion, error) {
	if suggestions == nil && fileName == nil {
		return nil, fmt.Errorf("No suggestions provided")
	}

	var subagentPrompt = "You are an agent tasked with organizing suggestions into an array of objects with the following structure: {startLine: number, endLine: number, oldString: string, newString: string}\nThese objects will be used to allow the user to accept or deny these suggestions. Make sure to include ALL of the suggestions in the user prompt"

	var suggestionPrompt = "Extract the right information from the following suggestions:"

	if suggestions != nil {
		suggestionPrompt += "\n"
		suggestionPrompt += *suggestions
	}
	if fileName != nil {
		file, err := repository.GetChatFilesByFileName(db, *fileName, sessionId, email)
		if err != nil && suggestions == nil {
			return nil, fmt.Errorf("Unable to retrieve file contents")
		}
		suggestionPrompt += "\n"
		if len(file) > 0 {
			suggestionPrompt += file[0].FileContents
		}
	}

	systemMessage := models.AiMessage{
		Role:    "developer",
		Content: &subagentPrompt,
	}
	suggestionMessage := models.AiMessage{
		Role:    "user",
		Content: &suggestionPrompt,
	}
	messages := []models.AiMessage{systemMessage, suggestionMessage}

	cfg := config.Get()
	requestUrl := "https://ai-gateway.vercel.sh/v1/chat/completions"
	requestBody := map[string]any{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   false,
		// "response_format": models.ResponseFormat{
		// 	Type: "json_schema",
		// 	JsonSchema: models.JsonSchema{
		// 		Name: "Suggestions",
		// 		Description: "An array of suggestions to offer the user",
		// 		Schema: models.ActualJsonSchema{
		// 			Type: "object",
		// 			Properties: map[string]models.JsonSchemaProperties{
		// 				"suggestions": models.JsonSchemaProperties{
		// 					type: "array
		// 				},
		// 			},
		// 		},
		// 	},
		// },
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI Gateway returned status %d", resp.StatusCode)
	}

	body, bodyErr := io.ReadAll(resp.Body)
	if bodyErr != nil {
		fmt.Printf("[GITHUB EMAIL BODY]: %s\n", bodyErr)
	}
	defer resp.Body.Close()

	var suggestionResults []models.Suggestion
	jsonErr := json.Unmarshal(body, &suggestionResults)
	if jsonErr != nil {
		return nil, fmt.Errorf("unable to parse suggestion json")
	}

	return suggestionResults, nil
}
