import { getAgentStream, getVnObjectById } from "@/services/api-service";
import { AiMessage, MessageInput, MessageStates } from "@/types/ai-types"
import { PanelType } from "@/types/editor-types";
import { VnObject } from "@/types/primitive-types";
import { Vim } from "@replit/codemirror-vim"
import { v4 } from "uuid";

export const applyAgentBindings = ({
	setMessageMap,
	setInputMessageMap,
	getActivePane,
	getActivePanel,
	getMessageMap,
	getInputMessageMap,
	getLocationMap,
}: {
	setMessageMap: (messageMap: MessageStates) => void,
	setInputMessageMap: (inputMap: { [paneId: string]: MessageInput }) => void,
	getActivePane: () => string,
	getActivePanel: () => PanelType,
	getMessageMap: () => MessageStates,
	getInputMessageMap: () => { [paneId: string]: MessageInput },
	getLocationMap: () => {
		[uuid: string]: {
			location: string,
			name: string,
			isFile: boolean,
		},
	}
}) => {
	const renderStream = async (response: Response) => {
		const activePane: string = getActivePane();
		const reader = response.body?.getReader();
		if (!reader) return;
		const decoder = new TextDecoder("utf-8");
		const newMessages = [...getMessageMap()[activePane].messages];
		const curAiMessage: AiMessage = {
			type: "message",
			role: "assistant",
		}
		newMessages.push(curAiMessage);
		setMessageMap({
			...getMessageMap(), [activePane]: {
				messages: newMessages,
				streaming: true,
				sessionId: getMessageMap()[activePane].sessionId,
			}
		});
		let buffer = "";
		const toolCallMap: Map<number, { id?: string; name: string; arguments: string }> = new Map();
		let text = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				setMessageMap({
					...getMessageMap(), [activePane]: {
						...getMessageMap()[activePane],
						streaming: false
					}
				});
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";

			const parsedLines = lines
				.map((line) => line.replace(/^data: /, "").trim())
				.filter((line) => line !== "" && line !== "[DONE]");

			for (const line of parsedLines) {
				try {
					const parsed = JSON.parse(line);
					const delta = parsed.choices?.[0]?.delta;

					if (delta?.content) {
						text += delta.content;
					} else if (delta?.tool_calls) {
						const toolCalls = delta?.tool_calls;
						if (toolCalls && Array.isArray(toolCalls)) {
							for (const tc of toolCalls) {
								const index: number = tc.index;
								if (toolCallMap.has(index)) {
									const existing = toolCallMap.get(index)!;
									if (tc.function?.name) existing.name += tc.function.name;
									if (tc.function?.arguments) existing.arguments += tc.function.arguments;
								} else {
									toolCallMap.set(index, {
										id: tc.id,
										name: tc.function?.name || "",
										arguments: tc.function?.arguments || "",
									});
								}
							}
						}

						const toolCallEntries = Array.from(toolCallMap.entries());
						const sortedToolCalls: { id?: string, name: string, arguments: string }[] = toolCallEntries.sort((entryA, entryB) => {
							return entryA[0] - entryB[0];
						}).map((entry) => entry[1]);

						let toolCallDisplay = "";
						for (const tc of sortedToolCalls) {
							let argsDisplay = tc.arguments;
							try {
								const parsedArgs = JSON.parse(tc.arguments);
								argsDisplay = JSON.stringify(parsedArgs, null, 2);
							} catch { }
							toolCallDisplay += `\n**${tc.name}:**\n\`\`\`json\n${argsDisplay}\n\`\`\`\n`;
						}
						text = toolCallDisplay;
						curAiMessage.toolCalls = sortedToolCalls;
					}
					curAiMessage.content = text;
					setMessageMap({
						...getMessageMap(), [activePane]: {
							...getMessageMap()[activePane],
							messages: newMessages
						}
					});
				} catch { }
			}
		}
	}

	const parseUserMessage = async (message: string): Promise<string> => {
		let parsed = "";
		const uuidMap: {
			[uuid: string]: {
				location: string,
				name: string,
				isFile: boolean,
			},
		} = getLocationMap()
		const locationMap: { [location: string]: string } = {}
		for (const uuid of Object.keys(uuidMap)) {
			locationMap[uuidMap[uuid].location.split("||").map((str) => str.split("|")[1]).join("")] = uuid
		}

		let isPrompt: boolean = false;
		for (const word of message.split(" ")) {
			if (word in locationMap && !isPrompt) {
				const vnObject: VnObject | null = await getVnObjectById(locationMap[word]);
				parsed += " " + `[User's provided file content: ${vnObject?.contents}]`
			} else if (word in locationMap && isPrompt) {
				const vnObject: VnObject | null = await getVnObjectById(locationMap[word]);
				parsed += " " + `[User's provided prompt template: ${vnObject?.contents}`
			} else if (word === "/prompt") {
				parsed += "\nUse the following file contents to supplement the prompt:";
				isPrompt = true;
			}
			else {
				isPrompt = false;
				parsed += " " + word;
			}
		}
		return parsed;
	}

	Vim.defineAction("submitMessage", async () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.AGENT) {
			const activePane: string = getActivePane();
			const newMessages: AiMessage[] = activePane in getMessageMap() ? [...getMessageMap()[activePane].messages] : [];
			if (newMessages.length === 0) {
				setMessageMap({ ...getMessageMap(), [activePane]: { ...getMessageMap()[activePane], sessionId: v4() } });
			}
			newMessages.push({ type: "message", role: "user", content: (await parseUserMessage(getInputMessageMap()[activePane].buffer)) });
			setMessageMap({ ...getMessageMap(), [activePane]: { ...getMessageMap()[activePane], messages: newMessages } });
			const res: Response = await getAgentStream(newMessages, getMessageMap()[activePane].sessionId);
			setInputMessageMap({
				...getInputMessageMap(), [activePane]: {
					buffer: "\n",
					bufferVersion: getInputMessageMap()[activePane].bufferVersion + 1,
				}
			});
			await renderStream(res);
		}
	});
	Vim.unmap('<CR>', "false");
	Vim.mapCommand('<CR>', 'action', 'submitMessage', {}, { context: 'normal' });
}
