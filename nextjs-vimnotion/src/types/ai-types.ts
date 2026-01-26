export type AiMessage = {
	role: "user" | "assistant" | "developer",
	type: "message",
	content: string,
}
