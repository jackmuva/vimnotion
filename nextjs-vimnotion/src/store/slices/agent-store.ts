import { MessageInput, MessageStates } from "@/types/ai-types";
import { StoreSetter, StoreGetter } from "../store-types";

export const createAgentSlice = (
	set: StoreSetter,
	get: StoreGetter
) => ({
	messageMap: {},
	inputMessageMap: {},
	getMessageMap: (): MessageStates => {
		return get().messageMap;
	},
	getInputMessageMap: (): { [paneId: string]: MessageInput } => {
		return get().inputMessageMap;
	},
	setMessageMap: (messageMap: MessageStates) => {
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
