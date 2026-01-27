import { getAgentStream } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
import { AiMessage } from "@/types/ai-types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const SyntaxHighlighter = dynamic(
	() => import("react-syntax-highlighter").then((mod) => mod.Prism),
	{ ssr: false }
);

export const AgentEditor = ({
	paneId
}: {
	paneId: string
}) => {
	const activeId: string = useEditorStore((state) => state.activePane);
	const [input, setInput] = useState<string>("");
	const [mode, setMode] = useState<"INPUT" | "LOADING">("INPUT");
	const [messages, setMessages] = useState<AiMessage[]>([]);

	const inputRef = useRef<string>(input);
	const modeRef = useRef<string>(mode);
	const messagesRef = useRef<AiMessage[]>(messages);

	useEffect(() => {
		inputRef.current = input;
		modeRef.current = mode;
		messagesRef.current = messages;
	}, [input, mode, messages])

	useEffect(() => {
		if (activeId === paneId) {
			const textInput = window.document.getElementById("agent-input");
			textInput?.focus();

		}
	}, [activeId, mode]);

	const renderStream = async (response: Response) => {
		const reader = response.body?.getReader();
		if (!reader) return;
		const decoder = new TextDecoder("utf-8");
		let text = "";
		const newMessages = [...messagesRef.current];
		const curAiMessage: AiMessage = {
			type: "message",
			role: "assistant",
			content: text,
		}
		newMessages.push(curAiMessage);
		setMessages(newMessages);
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
						setMessages([...newMessages]);
					}
				} catch { }
			}
		}
		setMode("INPUT");
	}

	useEffect(() => {
		const handleCr = async (event: KeyboardEvent) => {
			if (event.key === "Enter" && modeRef.current === "INPUT") {
				console.log("submitted");
				event.preventDefault();
				event.stopImmediatePropagation();
				setMode("LOADING");
				const newMessages = [...messagesRef.current];
				newMessages.push({ type: "message", role: "user", content: inputRef.current });
				setMessages(newMessages);
				const res: Response = await getAgentStream(newMessages);
				setInput("");
				await renderStream(res);

			}
		};
		document.addEventListener("keydown", handleCr);

		return () => {
			document.removeEventListener("keydown", handleCr);
		};
	}, []);

	useEffect(() => {
		requestAnimationFrame(() => {
			const view = document.getElementById("messages-view");
			view?.scrollTo(0, view?.scrollHeight);
		});
	}, [messages]);

	console.log("messages: ", messages);

	return (

		<div className={`relative h-full w-full rounded-sm z-20 bg-background 
			flex flex-col items-center space-y-2 p-2
			${messages.length === 0 ? "justify-center" : "justify-start"} font-robo-mono`}>
			<div className={`flex flex-col items-center justify-between max-w-[900px] w-full gap-8 ${messages.length > 0 ? "h-full" : ""}`}>
				{messages.length === 0 && <div className="text-5xl font-bold dark:text-indigo-400 text-indigo-600">
					VN <span className="text-orange-500">[E]</span>ditor
				</div>}
				{messages.length > 0 && <div id="messages-view" className="flex flex-col w-full overflow-y-auto flex-1 min-h-0 gap-2">
					{messages.map((message, i) => {
						return (
							<div className={`${message.role === "user" ? "bg-foreground-muted/20 pl-2 border-l-3 border-orange-500" : ""} px-1 py-4`}
								key={i}>
								<Markdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeRaw]}
									components={{
										code({ node, inline, className, children, ...props }: any) {
											const match = /language-(\w+)/.exec(className || '');

											return !inline && match ? (
												<SyntaxHighlighter language={match[1]}
													PreTag="div"
													style={gruvboxDark}>
													{String(children).replace(/\n$/, '')}
												</SyntaxHighlighter>
											) : (
												<code className={className} {...props}>
													{children}
												</code>
											);
										},
									}}
								>

									{message.content}
								</Markdown>
							</div>
						);
					})}
				</div>}
				<form className="w-full">
					<textarea className="w-full outline outline-offset-2 outline-foreground-muted/50 
					bg-foreground-muted/10 px-1 py-0.5"
						id="agent-input"
						value={input}
						disabled={mode !== "INPUT"}
						placeholder="Proofread, edit, bounce ideas..."
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
							setInput(e.target.value)
						}}
					/>
				</form>
			</div>

		</div>
	);
}
