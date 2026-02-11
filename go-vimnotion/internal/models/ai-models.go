package models

// NOTE: Internal message types to send to API
type AiMessage struct {
	Role       string       `json:"role"`
	Content    *string      `json:"content,omitempty"`
	ToolCalls  []AiToolCall `json:"tool_calls,omitempty"`
	ToolCallId *string      `json:"tool_call_id,omitempty"`
}

type AiToolCall struct {
	Id       string       `json:"id"`
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

// NOTE: Chat Completion Data types from OpenAI / Responses
type ChatCompletionData struct {
	Id                string        `json:"id"`
	Object            string        `json:"object"`
	Created           int           `json:"created"`
	Model             string        `json:"model"`
	Choices           []ChatChoices `json:"choices"`
	SystemFingerprint string        `json:"system_fingerprint"`
}

type ChatChoices struct {
	Index        int                    `json:"index"`
	FinishReason string                 `json:"finish_reason"`
	Delta        map[string]interface{} `json:"delta"`
}

type MessageDelta struct {
	Content string `json:"content"`
}

type ToolCallDelta struct {
	Index    int          `json:"index"`
	Id       *string      `json:"id"`
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name      *string `json:"name"`
	Arguments *string `json:"arguments"`
}

type ResponseFormat struct {
	Type       string     `json:"type"`
	JsonSchema JsonSchema `json:"json_schema"`
}

type JsonSchema struct {
	Name                 string           `json:"name"`
	Description          string           `json:"description"`
	Required             []string         `json:"required"`
	AdditionalProperties bool             `json:"additionalProperties"`
	Schema               ActualJsonSchema `json:"schema"`
	Strict               bool             `json:"strict"`
}

type ActualJsonSchema struct {
	Type                 string                          `json:"type"`
	Properties           map[string]JsonSchemaProperties `json:"properties"`
	Required             []string                        `json:"required"`
	AdditionalProperties bool                            `json:"additionalProperties"`
}

type JsonSchemaProperties struct {
	Type        string          `json:"type"`
	Description string          `json:"description"`
	Items       *map[string]any `json:"items"`
}

// NOTE: Use this internally to define tools
type AiTool struct {
	Type     string     `json:"type"`
	Function AiFunction `json:"function"`
}

type AiFunction struct {
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Parameters  AiFunctionParams `json:"parameters"`
}

type AiFunctionParams struct {
	Type       string                          `json:"type"`
	Properties map[string]AiFunctionProperties `json:"properties"`
	Required   []string                        `json:"required"`
}

type AiFunctionProperties struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Items       *struct {
		Type string `json:"type"`
	} `json:"items,omitempty"`
}
