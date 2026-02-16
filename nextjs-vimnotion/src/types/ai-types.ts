export type ToolCall = {
	id?: string;
	name: string;
	arguments: string;
}

export type AiMessage = {
	role: "user" | "assistant" | "developer" | "tool",
	type: "message" | "function",
	content?: string,
	toolCalls?: ToolCall[],
}

export type MessageInput = {
	buffer: string,
	bufferVersion: number,
}

export type MessageStates = {
	[paneId: string]: {
		messages: AiMessage[],
		streaming: boolean,
		sessionId: string,
	}
}
