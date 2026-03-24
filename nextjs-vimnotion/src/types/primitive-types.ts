import { AiMessage } from "./ai-types"

export type VnObject = {
	id: string,
	name: string,
	isFile: boolean,
	contents: string,
	updateDate: string,
	public: boolean,
	email?: string,
}

export type Suggestion = {
	id: string,
	vnObjectId: string,
	email: string,
	startLine: number,
	endLine: number,
	oldString: string,
	newString: string,
	explanation: string,
}

export type ChatSession = {
	sessionId: string,
	messages: AiMessage[],
	summary: string,
	updateDate: string,
	email: string,
	tokens: number,
}

