import { useEditorStore } from "@/store/editor-store";
import { PanelType } from "@/types/editor-types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getAiStream } from "@/services/api-service";
const SyntaxHighlighter = dynamic(
	() => import("react-syntax-highlighter").then((mod) => mod.Prism),
	{ ssr: false }
);

export const AiModal = () => {
	const [input, setInput] = useState<string>("");
	const [ascii, setAscii] = useState<null | string>(null);
	const [mode, setMode] = useState<"INPUT" | "CONFIRM" | "LOADING">("INPUT");
	const { toggleAiModal, setActivePanel, setNewAiBlock } = useEditorStore((state) => state);
	const inputRef = useRef(input);
	const modeRef = useRef(mode);
	const asciiRef = useRef(ascii);

	useEffect(() => {
		inputRef.current = input;
	}, [input]);

	useEffect(() => {
		modeRef.current = mode;
	}, [mode]);

	useEffect(() => {
		asciiRef.current = ascii;
	}, [ascii]);


	const renderStream = async (response: Response) => {
		const reader = response.body?.getReader();
		if (!reader) return;
		const decoder = new TextDecoder("utf-8");
		let text = "";

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
						setAscii(text);
					}
				} catch { }
			}
		}
		if (!text.startsWith("```") && !text.endsWith("```")) {
			text = "```\n" + text + "\n```";
		}
		setAscii(text);
		setMode("CONFIRM");
	}

	console.log(ascii);

	useEffect(() => {
		setActivePanel(PanelType.MODAL);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleAiModal();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleCrKeyDown = async (event: KeyboardEvent) => {
			if (event.key === "Enter" && modeRef.current === "INPUT") {
				event.preventDefault();
				event.stopImmediatePropagation();
				setMode("LOADING");
				const res: Response = await getAiStream(inputRef.current);
				setInput("");
				await renderStream(res);
			}
		};
		document.addEventListener('keydown', handleCrKeyDown);

		const handleYKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'y' && modeRef.current === "CONFIRM") {
				if (asciiRef.current) {
					event.preventDefault();
					event.stopImmediatePropagation();
					setNewAiBlock(asciiRef.current);
					toggleAiModal();
				}
			}
		};
		document.addEventListener('keydown', handleYKeyDown);

		const handleNKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'n' && modeRef.current === "CONFIRM") {
				event.preventDefault();
				event.stopImmediatePropagation();
				setAscii("");
				setMode("INPUT");
			}
		};
		document.addEventListener('keydown', handleNKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleCrKeyDown);
			document.removeEventListener('keydown', handleYKeyDown);
			document.removeEventListener('keydown', handleNKeyDown);
		}
	}, [toggleAiModal, setActivePanel]);

	useEffect(() => {
		if (mode === "CONFIRM") {
			const button = document.getElementById("insert-ascii-option");
			button?.focus();
		} else if (mode === "INPUT") {
			const input = document.getElementById("ai-modal-input");
			input?.focus();
		}
	}, [mode]);

	useEffect(() => {
		const view = document.getElementById("ascii-view");
		view?.scrollTo(0, view?.scrollHeight);
	}, [ascii]);

	return (
		<div className="font-robo-mono text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 h-[600px] max-h-11/12 max-w-11/12 w-[900px] 
			flex flex-col items-center bg-background">
			<div className="h-full w-full flex flex-col justify-between">
				<div className={`w-full h-full outline-offset-2 outline outline-foreground-muted/50 
					p-3 mb-4 overflow-y-auto`}
					id="ascii-view">
					{mode === "LOADING" && !ascii && <div className="h-full w-full flex justify-center items-center">
						<div className="animate-pulse text-base">drawing...</div>
					</div>}
					{ascii && <Markdown
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
						{ascii}
					</Markdown>
					}
				</div>
				<div className="w-full bg-background">
					{mode !== "CONFIRM" && <input type="text" className="w-full outline outline-offset-2 outline-foreground-muted/50 
					bg-foreground-muted/10 px-1 py-0.5"
						id="ai-modal-input"
						value={input}
						disabled={mode !== "INPUT"}
						placeholder="Describe what type of ASCII art or diagram you'd like"
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setInput(e.target.value)
						}} />}
					{mode === "CONFIRM" &&
						<div className="w-full flex gap-8 justify-center text-xl bg-foreground-muted/10
							outline outline-offset-2 outline-foreground-muted/50 py-2">
							<div>
								<button id="insert-ascii-option"
									className="cursor-pointer"
									onClick={() => {
										if (asciiRef.current) {
											setNewAiBlock(asciiRef.current);
											toggleAiModal();
										}
									}}>
									<span className="font-bold text-orange-500">[y]</span>
								</button>es, insert
							</div>
							<div>
								<button
									className="cursor-pointer"
									onClick={() => {
										setMode("INPUT");
									}}>
									<span className="font-bold text-orange-500">[n]</span>
								</button>o, cancel
							</div>
						</div>}
				</div>
			</div>
		</div >
	);
}
