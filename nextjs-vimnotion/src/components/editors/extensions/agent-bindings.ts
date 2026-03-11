import { getAgentStream, getVnObjectById } from "@/services/api-service";
import { AiMessage } from "@/types/ai-types"
import { PanelType, PaneNode } from "@/types/editor-types";
import { Suggestion, VnObject } from "@/types/primitive-types";
import { DirectoryChanges, DirectoryTree } from "@/types/sidebar-types";
import { Vim } from "@replit/codemirror-vim"
import { v4 } from "uuid";

export const applyAgentBindings = ({
	getPane,
	updatePane,
	getActivePanel,
	getDirectoryState,
	getLocationMap,
	getOilLine,
	openFileInBuffer,
	detectAllDirectoryChanges,
	setDirectoryConfirmation,
	toggleSidebar,
	setLocation,
	getLocation,
}: {
	getPane: () => PaneNode,
	updatePane: (paneNode: PaneNode) => void,
	getActivePanel: () => PanelType,
	getDirectoryState: () => DirectoryTree,
	getLocationMap: (diretoryState: DirectoryTree) => {
		[uuid: string]: {
			location: string,
			name: string,
			isFile: boolean,
		},
	},
	getOilLine: () => string,
	openFileInBuffer: () => void,
	detectAllDirectoryChanges: () => DirectoryChanges,
	setDirectoryConfirmation: () => void,
	toggleSidebar: () => void,
	setLocation: (loc: string) => void,
	getLocation: () => string,
}) => {
	const renderStream = async (response: Response) => {
		const reader = response.body?.getReader();
		if (!reader) return;
		const decoder: TextDecoder = new TextDecoder("utf-8");
		const paneId: string = Object.keys(getPane())[0];
		const getPaneData = () => getPane()[Object.keys(getPane())[0]];
		const newMessages = [...getPaneData().agentState.messages];
		const curAiMessage: AiMessage = {
			type: "message",
			role: "assistant",
		}
		newMessages.push(curAiMessage);
		updatePane({
			[paneId]: {
				...getPaneData(),
				agentState: {
					...getPaneData().agentState,
					messages: newMessages,
					streaming: true,
				}
			}
		});

		let buffer = "";
		const toolCallMap: Map<number, { id?: string; name: string; arguments: string }> = new Map();
		let text = "";
		let toolIndex: number = 0;

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				updatePane({
					[paneId]: {
						...getPaneData(),
						agentState: {
							...getPaneData().agentState,
							streaming: false,
						}
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
								if (tc.id) {
									toolIndex += 1;
									toolCallMap.set(toolIndex, {
										id: tc.id,
										name: tc.function?.name || "",
										arguments: tc.function?.arguments || "",
									});
								} else {
									const existing = toolCallMap.get(toolIndex)!;
									if (tc.function?.name) existing.name += tc.function.name;
									if (tc.function?.arguments) existing.arguments += tc.function.arguments;
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
					updatePane({
						[paneId]: {
							...getPaneData(),
							agentState: {
								...getPaneData().agentState,
								messages: newMessages
							}
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
		} = getLocationMap(getDirectoryState())
		const locationMap: { [location: string]: string } = {}
		for (const uuid of Object.keys(uuidMap)) {
			locationMap["@" + uuidMap[uuid].location.split("||").map((str) => str.split("|")[1]).join("")] = uuid
		}

		let isPrompt: boolean = false;
		for (const line of message.split("\n")) {
			for (const word of line.split(" ")) {
				if (word in locationMap && !isPrompt) {
					parsed += " " + `[User's provided file: \nvnObjectId: ${locationMap[word]}]\n`
				} else if (word in locationMap && isPrompt) {
					const vnObjectData: { file: VnObject | null, suggestions: Suggestion[] } | null = await getVnObjectById(locationMap[word]);
					parsed += " " + vnObjectData?.file?.contents
				} else if (word === "/prompt") {
					isPrompt = true;
				} else {
					isPrompt = false;
					parsed += " " + word;
				}
			}
		}
		return parsed;
	}

	Vim.defineAction("submitMessage", async () => {
		const paneId: string = Object.keys(getPane())[0];
		const getPaneData = () => getPane()[Object.keys(getPane())[0]];
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN && getPaneData().agentState.agentActive) {
			const newMessages: AiMessage[] = getPaneData().agentState.messages;
			if (newMessages.length === 0) {
				updatePane({
					[paneId]: {
						...getPaneData(),
						agentState: {
							...getPaneData().agentState,
							sessionId: v4()
						}
					}
				});
			}
			newMessages.push({ type: "message", role: "user", content: (await parseUserMessage(getPaneData().buffer)) });
			updatePane({
				[paneId]: {
					...getPaneData(),
					agentState: {
						...getPaneData().agentState,
						messages: newMessages
					},
					buffer: "\n",
					bufferVersion: getPaneData().bufferVersion + 1,
				}
			});
			const res: Response = await getAgentStream(newMessages, getPaneData().agentState.sessionId);
			await renderStream(res);
		} else if (activePanel === PanelType.SIDEBAR) {
			const newChanges: DirectoryChanges = detectAllDirectoryChanges();
			if (getOilLine().at(-1) === "/") {
				setLocation(getLocation() + getOilLine());
			} else if (newChanges.created.length !== 0 || newChanges.deleted.length !== 0 || newChanges.moved.length !== 0) {
				setDirectoryConfirmation();
			} else {
				openFileInBuffer();
				toggleSidebar();
			}
		}
	});
	Vim.unmap('<CR>', "false");
	Vim.mapCommand('<CR>', 'action', 'submitMessage', {}, { context: 'normal' });
}
