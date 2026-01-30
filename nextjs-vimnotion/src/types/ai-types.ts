export type AiMessage = {
	role: "user" | "assistant" | "developer",
	type: "message" | "function",
	content?: string,
	toolCall?: string,
}
