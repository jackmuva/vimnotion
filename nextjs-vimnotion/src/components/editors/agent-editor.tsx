import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef, useState, memo, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const SyntaxHighlighter = dynamic(
	() => import("react-syntax-highlighter").then((mod) => mod.Prism),
	{ ssr: false }
);
import { Compartment } from '@codemirror/state';
import { birdsOfParadise as darkTheme, noctisLilac as lightTheme } from 'thememirror';
import { customTheme } from "./vim-editor-theme";
import {
	EditorView,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	highlightActiveLine,
	keymap
} from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { EditorState, Extension } from "@codemirror/state";
import { PanelType } from "@/types/editor-types";
import { AiMessage, MessageInput } from "@/types/ai-types";

const Message = memo(({ message }: { message: AiMessage }) => {
	return (
		<div className={`${message.role === "user" ? "bg-foreground-muted/20 pl-2 border-l-3 border-orange-500" : ""} px-1 py-4`}>
			<Markdown remarkPlugins={[remarkGfm]}
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
				}} >
				{message.content}
			</Markdown>
		</div>
	);
});
Message.displayName = "Message";

export const AgentEditor = ({
	paneId
}: {
	paneId: string
}) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);

	const messages: AiMessage[] = useEditorStore((state) => state.messageMap[paneId]);
	const inputBufferVersion: number = useEditorStore((state) => state.inputMessageMap[paneId]?.bufferVersion);
	const getInputMessageMap = useEditorStore((state) => state.getInputMessageMap);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);
	const activePane = useEditorStore((state) => state.activePane);

	const bufferChangeListener: Extension = EditorView.updateListener.of((v) => {
		if (v.docChanged) {
			useEditorStore.getState().updateInputMessageMap({
				[paneId]: {
					buffer: v.state.doc.toString(),
					bufferVersion: 0
				}
			});
		}
	});

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
		}

		if (typeof window !== 'undefined' && vimEditor) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = (event: MediaQueryListEvent) => {
				if (event.matches) {
					vimEditor?.dispatch({
						effects: theme.reconfigure(darkTheme),
					});

				} else {
					vimEditor?.dispatch({
						effects: theme.reconfigure(lightTheme),
					});
				}
			};
			mediaQuery.addEventListener('change', handleChange);

			useEditorStore.getState().updateInputMessageMap({
				[paneId]: {
					buffer: vimEditor.state.doc.toString(),
					bufferVersion: 0
				}
			});

			return () => {
				mediaQuery.removeEventListener('change', handleChange);
			};
		}
	}, [vimEditor, theme]);

	useEffect(() => {
		setActivePanel(PanelType.AGENT);
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#agent-editor`);
		if (!editorElement) {
			return;
		}

		const view = new EditorView({
			doc: "\n",
			extensions: [
				customTheme,
				vim(),
				highlightActiveLineGutter(),
				highlightSpecialChars(),
				history(),
				foldGutter(),
				drawSelection(),
				dropCursor(),
				EditorState.allowMultipleSelections.of(true),
				indentOnInput(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				rectangularSelection(),
				crosshairCursor(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...foldKeymap,
					...completionKeymap,
					...lintKeymap
				]),
				theme.of(lightTheme),
				bufferChangeListener,
			],
			parent: editorElement,
		});

		if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			view.dispatch({
				effects: theme.reconfigure(darkTheme),
			});
		}
		setVimEditor(view);
	}, [isClient]);

	useEffect(() => {
		if (activePane === paneId && vimEditor) {
			vimEditor.focus();
		}
	}, [activePane]);

	useEffect(() => {
		const view = document.getElementById("messages-view");
		if (view) {
			view.scrollTo({ top: view.scrollHeight, behavior: "smooth" });
		}
	}, [messages?.at(-1)?.content ?? ""]);


	useEffect(() => {
		if (vimEditor) {
			vimEditor.dispatch({
				changes: {
					from: 0,
					to: vimEditor.state.doc.length,
					insert: getInputMessageMap()[paneId].buffer ?? "",
				},
			});
		}
	}, [inputBufferVersion]);

	const memoizedMessages = useMemo(() => {
		console.log("messages: ", messages);
		return (messages &&
			<div id="messages-view" className="flex flex-col w-full overflow-y-auto flex-1 min-h-0 gap-2">
				{messages.map((message, i) => (
					<Message key={`${i}-${message.content?.length ?? 0}`} message={message} />
				))}
				{messages.at(-1)?.toolCalls &&
					messages.at(-1)!.toolCalls?.map((tool) => tool.name).includes("assign_subagent_tool") &&
					messages.at(-1)!.streaming &&
					<div className="w-full dark:text-indigo-300 text-blue-500 animate-pulse italic">
						Subagent working...
					</div>}
			</div>)
	}, [messages, messages?.at(-1)?.content, messages?.at(-1)?.streaming, messages.at(-1)?.toolCalls]);

	return (

		<div className={`relative h-full w-full rounded-sm z-20 bg-background 
			flex flex-col items-center space-y-2 p-2
			${!messages ? "justify-center" : "justify-start"} font-robo-mono`}>
			<div className={`flex flex-col items-center justify-between max-w-[900px] w-full gap-8 
					${messages ? "h-full" : ""}`}>
				{!messages && <div className="text-5xl font-bold dark:text-indigo-300 text-blue-500">
					<span className="text-orange-500">[E]</span>ditor
				</div>}
				{memoizedMessages}
				<div className="w-full outline outline-offset-2 outline-foreground-muted/50"
					id="agent-editor"
				/>
			</div>

		</div>
	);
}
