export type ToolCall = {
	id?: string;
	name: string;
	arguments: string;
}

export type AiMessage = {
	role: "user" | "assistant" | "developer" | "tool",
	type: "message" | "function",
	streaming?: boolean,
	content?: string,
	toolCalls?: ToolCall[],
}

export type MessageInput = {
	buffer: string,
	bufferVersion: number,
}
