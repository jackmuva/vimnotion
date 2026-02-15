import { AiMessage, MessageInput } from "@/types/ai-types";
import { EditorState } from "../editor-store";

export const createAgentSlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	messageMap: {},
	inputMessageMap: {},
	getMessageMap: (): {
		[paneId: string]: {
			messages: AiMessage[],
			streaming: boolean,
		}
	} => {
		return get().messageMap;
	},
	getInputMessageMap: (): { [paneId: string]: MessageInput } => {
		return get().inputMessageMap;
	},
	setMessageMap: (messageMap: {
		[paneId: string]: {
			messages: AiMessage[],
			streaming: boolean,
		}
	}) => {
		set({ messageMap: messageMap });
	},
	setInputMessageMap: (input: { [paneId: string]: MessageInput }) => {
		set({ inputMessageMap: input });
	},
	updateInputMessageMap: (input: { [paneId: string]: MessageInput }): void => {
		set({
			inputMessageMap: {
				...get().inputMessageMap,
				[Object.keys(input)[0]]: input[Object.keys(input)[0]]
			}
		});
	},
});
