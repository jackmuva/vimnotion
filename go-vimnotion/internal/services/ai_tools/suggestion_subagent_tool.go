package aitools

import (
	"bytes"
	"database/sql"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
	"vimnotion.com/server/internal/config"
	"vimnotion.com/server/internal/models"
	"vimnotion.com/server/internal/repository"
)

//go:embed suggestion_subagent_tool_description.md
var suggestToolDescription string

var SuggestionSubagentTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name:        "suggestion_subagent_tool",
		Description: suggestToolDescription,
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
				"vnObjectId": {
					Type:        "string",
					Description: "The user message will have a vnObjectId represent the id of the file they provided",
				},
				"suggestions": {
					Type:        "string",
					Description: "All edits suggested to a user's file",
				},
				"fileName": {
					Type:        "string",
					Description: "If suggestions are in a file, include the filename",
				},
			},
			Required: []string{"vnObjectId"},
		},
	},
}

func ExecuteSuggestionSubagentTool(vnObjectId string, suggestions *string, fileName *string, email string, sessionId string, db *sql.DB) ([]models.Suggestion, error) {
	if suggestions == nil && fileName == nil {
		return nil, fmt.Errorf("No suggestions provided")
	}

	var subagentPrompt = "You are an agent tasked with organizing suggestions into an array of objects with the following structure: {startLine: number, endLine: number, oldString: string, newString: string, explanation: string}\nThese objects will be used to allow the user to accept or deny these suggestions. Make sure to include ALL of the suggestions in the user prompt"

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
	requestBody := map[string]interface{}{
		"model":    "anthropic/claude-haiku-4.5",
		"messages": messages,
		"stream":   false,
		"output_config": models.OutputConfig{
			Format: models.OutputFormat{
				Type: "json_schema",
				Schema: models.ActualJsonSchema{
					Type:                 "object",
					AdditionalProperties: false,
					Required:             []string{"suggestions"},
					Properties: map[string]models.JsonSchemaProperties{
						"suggestions": {
							Type:        "array",
							Description: "Array of suggestion objects",
							Items: &map[string]any{
								"type":                 "object",
								"additionalProperties": false,
								"required":             []string{"startLine", "endLine", "oldString", "newString"},
								"properties": map[string]models.JsonSchemaProperties{
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
										Description: "Original text to replace",
									},
									"newString": {
										Type:        "string",
										Description: "New text to insert",
									},
									"explanation": {
										Type:        "string",
										Description: "Explanation for the suggested edit",
									},
								},
							},
						},
					},
				},
			},
		},
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Printf("unable to serialize request")
		return nil, fmt.Errorf("unable to serialize request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, requestUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		fmt.Printf("unable to create AI Gateway request")
		return nil, fmt.Errorf("unable to create AI Gateway request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+cfg.AiGatewayKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("unable to get AI Gateway response")
		return nil, fmt.Errorf("unable to get AI Gateway response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("Non OK status code from AI Gateway: %d\nResponse: %s\n", resp.StatusCode, string(errBody))
		return nil, fmt.Errorf("AI Gateway returned status %d: %s", resp.StatusCode, string(errBody))
	}

	body, bodyErr := io.ReadAll(resp.Body)
	if bodyErr != nil {
		fmt.Printf("Unable to read response body")
		return nil, fmt.Errorf("unable to read response body: %w", bodyErr)
	}

	var completion struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(body, &completion); err != nil {
		fmt.Printf("Unable to parse chat completion response")
		return nil, fmt.Errorf("unable to parse chat completion response: %w", err)
	}
	if len(completion.Choices) == 0 {
		fmt.Printf("No choices returned")
		return nil, fmt.Errorf("no choices returned from AI Gateway")
	}

	var suggestionsWrapper []models.Suggestion

	if err := json.Unmarshal([]byte(completion.Choices[0].Message.Content[8:len(completion.Choices[0].Message.Content)-3]), &suggestionsWrapper); err != nil {
		fmt.Printf("Raw content from AI: %s\n", completion.Choices[0].Message.Content[8:len(completion.Choices[0].Message.Content)-3])
		fmt.Printf("unable to parse suggestion json")
		return nil, fmt.Errorf("unable to parse suggestion json from content: %w", err)
	}
	for i := range suggestionsWrapper {
		suggestionsWrapper[i].Id = uuid.New().String()
		suggestionsWrapper[i].Email = email
		suggestionsWrapper[i].VnObjectId = vnObjectId
	}

	err = repository.BatchInsertSuggestions(db, suggestionsWrapper)
	if err != nil {
		return nil, fmt.Errorf("Unable to insert suggestions to vnobject: %s", vnObjectId)
	}

	return suggestionsWrapper, nil
}
