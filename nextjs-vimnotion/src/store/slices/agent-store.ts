import { MessageInput, MessageStates } from "@/types/ai-types";
import { StoreSetter, StoreGetter } from "../store-types";

export type AgentSlice = {
	messageMap: MessageStates;
	setMessageMap: (messageMap: MessageStates) => void;
	getMessageMap: () => MessageStates;
	inputMessageMap: { [paneId: string]: MessageInput };
	setInputMessageMap: (messageMap: { [paneId: string]: MessageInput }) => void;
	getInputMessageMap: () => { [paneId: string]: MessageInput };
	updateInputMessageMap: (input: { [paneId: string]: MessageInput }) => void;
};

export const createAgentSlice = <T extends AgentSlice>(
	set: StoreSetter<T>,
	get: StoreGetter<T>
): AgentSlice => ({
	messageMap: {},
	inputMessageMap: {},
	getMessageMap: (): MessageStates => {
		return get().messageMap;
	},
	getInputMessageMap: (): { [paneId: string]: MessageInput } => {
		return get().inputMessageMap;
	},
	setMessageMap: (messageMap: MessageStates) => {
		set({ messageMap: messageMap } as Partial<T>);
	},
	setInputMessageMap: (input: { [paneId: string]: MessageInput }) => {
		set({ inputMessageMap: input } as Partial<T>);
	},
	updateInputMessageMap: (input: { [paneId: string]: MessageInput }): void => {
		set({
			inputMessageMap: {
				...get().inputMessageMap,
				[Object.keys(input)[0]]: input[Object.keys(input)[0]]
			}
		} as Partial<T>);
	},
});
