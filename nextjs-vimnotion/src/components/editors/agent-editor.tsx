import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef, useState, memo, useMemo, useCallback } from "react";
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
import { Completion, CompletionContext, closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap, CompletionResult } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { EditorState, Extension } from "@codemirror/state";
import { PanelType, PaneNode } from "@/types/editor-types";
import { AiMessage } from "@/types/ai-types";
import { DirectoryTree } from "@/types/sidebar-types";
import { v4 } from "uuid";

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

	const messages: {
		messages: AiMessage[],
		streaming: boolean,
	} = useEditorStore((state) => state.messageMap[paneId]);
	const inputBufferVersion: number = useEditorStore((state) => state.inputMessageMap[paneId]?.bufferVersion);
	const getInputMessageMap = useEditorStore((state) => state.getInputMessageMap);
	const setMessageMap = useEditorStore((state) => state.setMessageMap);
	const getMessageMap = useEditorStore((state) => state.getMessageMap);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);
	const activePane = useEditorStore((state) => state.activePane);
	const directoryState: DirectoryTree = useEditorStore((state) => state.directoryState);
	const getLocationMap: (tree: DirectoryTree) => {
		[uuid: string]: {
			location: string,
			name: string,
			isFile: boolean,
		},
	} = useEditorStore((state) => state.constructLocationMapHelper);
	const { updateActivePane, getPaneById, getLocationById, setLocation } = useEditorStore(state => state);
	const pane: PaneNode = getPaneById(paneId);


	const slashCommands: { [command: string]: string } = {
		"/new": "/new [new session]",
		"/sessions": "/sessions [list past sessions]",
		"/prompt": "/prompt [custom prompt file]",
	};
	const atCommands: { location: string, uuid: string }[] = useMemo(() => {
		const locationMap = getLocationMap(directoryState);
		return Object.keys(locationMap).filter((uuid: string) => {
			return locationMap[uuid].isFile
		}).map((uuid: string) => {
			return {
				location: "@" + locationMap[uuid].location.split("||").map((str) => str.split("|")[1]).join(""),
				uuid: uuid,
			}
		})
	}, [directoryState, getLocationMap]);

	const atCompletionOptions: Completion[] = useMemo(() => {
		return atCommands.map((atObj: { location: string, uuid: string }) => {
			return {
				label: atObj.location,
				displayLabel: atObj.location,
				apply: atObj.location,
			};
		});
	}, [vimEditor, atCommands]);

	const atCompletions = useCallback(
		(context: CompletionContext): CompletionResult | null => {
			const regex = /(?<=^|\s)@[0-9a-zA-Z_\-]*$/;
			const word = context.matchBefore(regex);
			if (!word) return null;
			return {
				from: word.from,
				options: atCompletionOptions,
				// Reuse candidates as long as the word matches this regular expression
				validFor: /^\/[0-9a-zA-Z_\-]*$/,

			};
		}, [atCompletionOptions]);

	const slashCompletionOptions: Completion[] = useMemo(() => {
		return Object.keys(slashCommands).map((key: string) => {
			return {
				label: key,
				displayLabel: slashCommands[key],
				apply: key === "/new" ?
					(view: EditorView, completion: Completion, from: number, to: number) => {
						setMessageMap({
							...getMessageMap(),
							[paneId]: {
								messages: [],
								streaming: false,
								sessionId: v4(),
							}
						});

						view.dispatch({
							changes: { from, to, insert: "" }
						});
					}
					: key === "/prompt" ?
						(view: EditorView, completion: Completion, from: number, to: number) => {
							view.dispatch({
								changes: { from, to, insert: "/prompt @" }
							});
						}
						: key,
			};
		});
	}, [vimEditor, slashCommands]);

	const slashCompletions = useCallback(
		(context: CompletionContext): CompletionResult | null => {
			const regex = /(?<=^|\s)\/[0-9a-zA-Z_\-]*$/;
			const word = context.matchBefore(regex);
			if (!word) return null;
			return {
				from: word.from,
				options: slashCompletionOptions,
				// Reuse candidates as long as the word matches this regular expression
				validFor: /^\/[0-9a-zA-Z_\-]*$/,

			};
		}, [slashCompletionOptions]);

	const agentEditorAutocomplete: Extension = useMemo((): Extension => {
		return autocompletion({
			activateOnTyping: true,
			icons: false,
			override: [slashCompletions, atCompletions],
		})
	}, [slashCompletions, atCompletions]);

	const focusListener = EditorView.updateListener.of((v) => {
		if (v.view.hasFocus) {
			updateActivePane(paneId);
			const currentPane: PaneNode = getPaneById(paneId);
			const loc: string | null = getLocationById(currentPane[Object.keys(pane)[0]].fileId);
			if (loc) setLocation(loc);
		}
	});

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

		const editorElement = document.querySelector(`#agent-editor-${paneId}`);
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
				EditorView.lineWrapping,
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
				focusListener,
				agentEditorAutocomplete,
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
	}, [messages?.messages?.at(-1)?.content ?? ""]);


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
		return ((messages && messages.messages && messages.messages.length > 0) &&
			<div id="messages-view" className="flex flex-col w-full overflow-y-auto flex-1 min-h-0 gap-2">
				{messages.messages.map((message, i) => (
					<Message key={`${i}-${message.content?.length ?? 0}`} message={message} />
				))}
				{messages.messages.at(-1)?.toolCalls &&
					messages.messages.at(-1)!.toolCalls?.map((tool) => tool.name).includes("assign_subagent_tool") &&
					messages.streaming &&
					<div className="w-full dark:text-indigo-300 text-blue-500 animate-pulse italic">
						Subagent working...
					</div>}
			</div>)
	}, [messages, messages?.messages?.at(-1)?.content, messages?.messages?.at(-1)?.toolCalls, messages?.streaming]);

	return (

		<div className={`${activePane === paneId ? "outline-2 outline-offset-2 dark:outline-indigo-900 outline-indigo-300/70" : ""} relative h-full w-full z-20 bg-background 
			flex flex-col items-center space-y-2 p-2
			${(!messages || !messages.messages || messages.messages.length === 0) ? "justify-center" : "justify-start"} font-robo-mono`}>
			<div className={`flex flex-col items-center justify-between max-w-[900px] w-full gap-8 
					${(messages && messages.messages && messages.messages.length > 0) ? "h-full" : ""}`}>
				{(!messages || !messages.messages || messages.messages.length === 0) && <div className="text-5xl font-bold dark:text-indigo-300 text-blue-500">
					<span className="text-orange-500">[E]</span>ditor
				</div>}
				{memoizedMessages}
				<div className="w-full outline outline-offset-2 outline-foreground-muted/50"
					id={`agent-editor-${paneId}`}
				/>
			</div>

		</div>
	);
}
