package aitools

import "vimnotion.com/server/internal/models"

var PlanTool models.AiTool = models.AiTool{
	Type: "function",
	Function: models.AiFunction{
		Name: "plan_tool",
		Description: "Use this tool to break down a complex ask into smaller subtasks\n" +

			"## When to use this tool:\n" +
			"Use this tool when the user asks a complex task that's better off split into smaller tasks\n" +
			"that can be done step by step\n" +

			"<example>\n" +
			"User: Proofread this article for grammatical errors and overall coherence\n" +
			"Agent: I'll proofread this article paragraph by paragraph for grammatical errors and then read the entire paper for overall coherence\n" +
			"*Creates a plan for the overall task with subtasks*\n" +
			"1. Break the article down into paragraphs\n" +
			"2. Read each paragraph checking for grammatical errors, appending each paragraph's suggestions to a suggestions file\n" +
			"3. Read entire article and comment on overall structure and messaging, appending comments to the suggestions file\n" +
			"</example>\n" +

			"<reasoning>\n" +
			"Proofreading anything longer than a few paragraphs requires breaking down the task into smaller, more manageable tasks.\n" +
			"Asking for grammar checks and coherence are two separate tasks.\n" +
			"</reasoning>\n" +

			"## When NOT to use this tool:\n" +
			"Do NOT use this tool when the user prompts a task that is small and easily achievable in a single step\n" +

			"<example>\n" +
			"User: Edit line 15 to be more concise\n" +
			"Agent: I'll check that line and immediately return a more concise version of that sentence.\n" +
			"*Does NOT create a plan with subtasks*\n" +
			"</example>\n" +

			"<reasoning>\n" +
			"Editing one sentence or even a paragraph does not require decomposing the task into subtasks.\n" +
			"</reasoning>\n",
		Parameters: models.AiFunctionParams{
			Type: "object",
			Properties: map[string]models.AiFunctionProperties{
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
