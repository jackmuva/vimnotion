import { getAgentStream } from "@/services/api-service";
import { AiMessage, ToolCall } from "@/types/ai-types"
import { PanelType } from "@/types/editor-types";
import { Vim } from "@replit/codemirror-vim"

export const applyAgentBindings = ({
	setMessageMap,
	setInputMessageMap,
	getActivePane,
	getActivePanel,
	getMessageMap,
	getInputMessageMap,
}: {
	setMessageMap: (messageMap: { [paneId: string]: AiMessage[] }) => void,
	setInputMessageMap: (inputMap: { [paneId: string]: string }) => void,
	getActivePane: () => string,
	getActivePanel: () => PanelType,
	getMessageMap: () => { [paneId: string]: AiMessage[] },
	getInputMessageMap: () => { [paneId: string]: string },
}) => {
	const renderStream = async (response: Response) => {
		const activePane: string = getActivePane();
		const messageMap: { [paneId: string]: AiMessage[] } = getMessageMap();
		const reader = response.body?.getReader();
		if (!reader) return;
		const decoder = new TextDecoder("utf-8");
		const newMessages = [...messageMap[activePane]];
		const curAiMessage: AiMessage = {
			type: "message",
			role: "assistant",
		}
		newMessages.push(curAiMessage);
		setMessageMap({ ...messageMap, [activePane]: newMessages });
		let buffer = "";
		const toolCallMap: Map<number, { id?: string; name: string; arguments: string }> = new Map();
		let text = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

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

					const content = delta?.content;
					if (content) {
						text += content;
					}

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
					toolCallEntries.sort((entryA, entryB) => {
						const indexA = entryA[0];
						const indexB = entryB[0];
						return indexA - indexB;
					});
					const sortedToolCalls: ToolCall[] = toolCallEntries.map((entry) => entry[1]);

					let toolCallDisplay = "";
					for (const tc of sortedToolCalls) {
						let argsDisplay = tc.arguments;
						try {
							const parsedArgs = JSON.parse(tc.arguments);
							argsDisplay = JSON.stringify(parsedArgs, null, 2);
						} catch { }
						toolCallDisplay += `\n**${tc.name}:**\n\`\`\`json\n${argsDisplay}\n\`\`\`\n`;
					}

					curAiMessage.toolCalls = sortedToolCalls;
					curAiMessage.content = text + toolCallDisplay;
					setMessageMap({ ...messageMap, [activePane]: newMessages });
				} catch { }
			}
		}
	}

	Vim.defineAction("submitMessage", async () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.AGENT) {
			const activePane: string = getActivePane();
			const newMessages = activePane in getMessageMap() ? [...getMessageMap()[activePane]] : [];
			newMessages.push({ type: "message", role: "user", content: getInputMessageMap()[activePane] });
			setMessageMap({ ...getMessageMap(), [activePane]: newMessages });
			const res: Response = await getAgentStream(newMessages);
			setInputMessageMap({ ...getInputMessageMap(), [activePane]: "\n" });
			await renderStream(res);
		}
	});
	Vim.unmap('<CR>', "false");
	Vim.mapCommand('<CR>', 'action', 'submitMessage', {}, { context: 'normal' });

}


