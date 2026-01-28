package models

type AiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
	Type    string `json:"type"`
}

type ChatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		Index        int    `json:"index"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
}

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
