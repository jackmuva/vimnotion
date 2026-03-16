package aitools

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"sync"

	"vimnotion.com/server/internal/models"
)

func PopulateToolCallMap(toolCalls []interface{}, toolCallMap map[string]models.ToolCallDelta) {
	for _, tcRaw := range toolCalls {
		tcBytes, _ := json.Marshal(tcRaw)
		var tc models.ToolCallDelta
		if err := json.Unmarshal(tcBytes, &tc); err != nil {
			continue
		}
		if tc.Id != nil {
			if existing, ok := toolCallMap[*tc.Id]; ok {
				if tc.Function.Name != nil {
					*existing.Function.Name += *tc.Function.Name
				}
				if tc.Function.Arguments != nil {
					*existing.Function.Arguments += *tc.Function.Arguments
				}
				toolCallMap[*tc.Id] = existing
			} else {
				toolCallMap[*tc.Id] = tc
			}
		} else {
			for id, existing := range toolCallMap {
				if existing.Index == tc.Index {
					if tc.Function.Arguments != nil {
						*existing.Function.Arguments += *tc.Function.Arguments
					}
					toolCallMap[id] = existing
					break
				}
			}
		}
	}
}

const MaxConcurrentToolCalls = 5

func AppendToolCallMessages(messages []models.AiMessage, toolCallMap map[string]models.ToolCallDelta, email string, sessionId string, db *sql.DB) []models.AiMessage {
	var toolCalls []models.AiToolCall
	for _, v := range toolCallMap {
		toolCalls = append(toolCalls, models.AiToolCall{
			Id:       *v.Id,
			Type:     "function",
			Function: v.Function,
		})
	}
	messages = append(messages, models.AiMessage{
		Role:      "assistant",
		ToolCalls: toolCalls,
	})

	workerSem := make(chan struct{}, MaxConcurrentToolCalls)
	var workerWg sync.WaitGroup
	var messageMutex sync.Mutex

	for _, v := range toolCallMap {
		workerWg.Add(1)
		go func(v models.ToolCallDelta, email string, sessionId string, db *sql.DB) {
			defer workerWg.Done()
			workerSem <- struct{}{}
			defer func() { <-workerSem }()

			var execRes string
			args := *v.Function.Arguments
			if *v.Function.Name == "plan_tool" {
				var planArgs struct {
					PlanName string   `json:"planName"`
					Subtasks []string `json:"subtasks"`
				}
				err := json.Unmarshal([]byte(args), &planArgs)
				fmt.Printf("calling plan tool with args: %+v\n\n", planArgs)
				if err != nil {
					execRes = "Unable to parse plan tool args"
				}
				todos, fileId, err := ExecutePlanTool(planArgs.PlanName, planArgs.Subtasks, email, sessionId, db)
				if err != nil {
					execRes = "Error executing plan tool"
				} else {
					execRes = *todos + "\nTodos written to file with id: " + *fileId
				}
			} else if *v.Function.Name == "assign_subagent_tool" {
				var subagentArgs struct {
					Task           string `json:"task"`
					SubagentPrompt string `json:"subagentPrompt"`
				}
				err := json.Unmarshal([]byte(args), &subagentArgs)
				fmt.Printf("calling subagent tool with args: %+v\n\n", subagentArgs)
				if err != nil {
					execRes = "Error parsing subagent args"
				}
				subagentResponse, err := ExecuteAssignSubagentTool([]models.AiMessage{}, subagentArgs.Task, subagentArgs.SubagentPrompt, email, nil, sessionId, db)
				if err != nil {
					execRes = "Error executing subagent tool"
				} else {
					execRes = *subagentResponse
				}
			} else if *v.Function.Name == "write_file_tool" {
				var writeArgs struct {
					FileName     string `json:"fileName"`
					FileContents string `json:"fileContents"`
				}
				err := json.Unmarshal([]byte(args), &writeArgs)
				fmt.Printf("calling write tool with args: %+v\n\n", writeArgs)
				if err != nil {
					execRes = "Error parsing write file arguments"
				}
				err = ExecuteWriteFileTool(writeArgs.FileName, writeArgs.FileContents, email, sessionId, db)
				if err != nil {
					execRes = "Error writing file"
				} else {
					execRes = fmt.Sprintf("File '%s' written successfully", writeArgs.FileName)
				}
			} else if *v.Function.Name == "read_file_tool" {
				var readArgs struct {
					FileId string `json:"fileId"`
				}
				err := json.Unmarshal([]byte(args), &readArgs)
				if err != nil {
					execRes = "Error parsing read file arguments"
				}
				fmt.Printf("calling read tool with args: %+v\n\n", readArgs)
				fileContents, err := ExecuteReadFileTool(readArgs.FileId, email, sessionId, db)
				if err != nil {
					execRes = fmt.Sprintf("Error reading file: %s", err.Error())
				} else {
					execRes = *fileContents
				}
			} else if *v.Function.Name == "list_files_tool" {
				fmt.Printf("calling list tool \n\n")
				fileData, err := ExecuteListFilesTool(email, sessionId, db)
				if err != nil {
					execRes = fmt.Sprintf("Error listing files: %s", err.Error())
				} else {
					filesJson, jsonErr := json.Marshal(fileData)
					if jsonErr != nil {
						execRes = "Error serializing file list"
					} else {
						execRes = string(filesJson)
					}
				}
			} else if *v.Function.Name == "suggest_tool" {
				var suggestionArgs struct {
					VnObjectId  string `json:"vnObjectId"`
					StartLine   int    `json:"startLine"`
					EndLine     int    `json:"endLine"`
					OldString   string `json:"oldString"`
					NewString   string `json:"newString"`
					Explanation string `json:"explanation"`
				}
				err := json.Unmarshal([]byte(args), &suggestionArgs)
				fmt.Printf("calling suggest tool with args: %+v\n\n", suggestionArgs)
				if err != nil {
					execRes = "Error parsing suggestion arguments"
				} else {
					err := ExecuteSuggestTool(suggestionArgs.VnObjectId, suggestionArgs.StartLine, suggestionArgs.EndLine, suggestionArgs.OldString, suggestionArgs.NewString, suggestionArgs.Explanation, email, db)
					if err != nil {
						execRes = fmt.Sprintf("Error generating suggestions: %s", err.Error())
					} else {
						execRes = "Successfully created suggestions"
					}
				}
			}
			messageMutex.Lock()
			messages = append(messages, models.AiMessage{
				Role:       "tool",
				ToolCallId: v.Id,
				Content:    &execRes,
			})
			messageMutex.Unlock()
		}(v, email, sessionId, db)
	}
	workerWg.Wait()
	return messages
}
