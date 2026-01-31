import { AiMessage } from "@/types/ai-types";
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

	getMessageMap: (): { [paneId: string]: AiMessage[] } => {
		return get().messageMap;
	},
	getInputMessageMap: (): { [paneId: string]: string } => {
		return get().inputMessageMap;
	},
	setMessageMap: (messageMap: { [paneId: string]: AiMessage[] }) => {
		set({ messageMap: messageMap });
	},
	setInputMessageMap: (input: { [paneId: string]: string }) => {
		set({ inputMessageMap: input });
	}
});
