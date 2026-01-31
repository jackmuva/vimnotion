import { getAgentStream } from "@/services/api-service";
import { AiMessage } from "@/types/ai-types"
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
		let text = "";
		const newMessages = [...messageMap[activePane]];
		const curAiMessage: AiMessage = {
			type: "message",
			role: "assistant",
			content: text,
		}
		newMessages.push(curAiMessage);
		setMessageMap({ ...messageMap, [activePane]: newMessages });
		let buffer = "";
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
					const content = parsed.choices?.[0]?.delta?.content;
					if (content) {
						text += content;
						curAiMessage.content = text;
						setMessageMap({ ...messageMap, [activePane]: newMessages });
					}
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


