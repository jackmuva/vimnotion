import { useEditorStore } from "@/store/editor-store";
import { PanelType, PaneNode } from "@/types/editor-types";
import { useEffect, useRef, useState } from "react";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { htmlToMarkdown, markdownToHtml } from "@/lib/utils";
import { CustomFileHandler } from "./markdown-file-handler";
import { SuggestionSidebar } from "./suggestion-sidebar";
import { TableKit } from '@tiptap/extension-table';
import { TaskList, TaskItem } from "@tiptap/extension-list";

export const MarkdownEditor = ({
	paneId
}: {
	paneId: string,
}) => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePane);
	const pane: PaneNode = getPane(paneId);
	const activePane: string = useEditorStore((state) => state.activePane);
	const activePanel: PanelType = useEditorStore((state) => state.activePanel);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const toggleSidebar = useEditorStore((state) => state.toggleSidebar);
	const updateActivePane = useEditorStore((state) => state.updateActivePane);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);
	const updateAllBuffers = useEditorStore((state) => state.updateAllBuffers);
	const getActivePane = useEditorStore((state) => state.getActivePane);

	const [mode, setMode] = useState<"COMMAND" | "INSERT">("COMMAND");
	const modeRef = useRef<"COMMAND" | "INSERT">("COMMAND");

	useEffect(() => {
		modeRef.current = mode;
	}, [mode])

	const editor = useEditor({

		extensions: [StarterKit, Image, CustomFileHandler, TableKit,
			TaskList.configure({
				HTMLAttributes: {
					class: "contains-task-list"
				}
			}),
			TaskItem.configure({
				HTMLAttributes: {
					class: "task-list-item"
				},
				a11y: {
					checkboxLabel(_, checked) {
						return checked ? "task completed" : "task incomplete"
					},
				}
			})],
		content: '<p>Loading...</p>',
		immediatelyRender: false,
		onCreate: async ({ editor: currentEditor }) => {
			console.log("html: ", await markdownToHtml(pane[paneId].buffer));
			currentEditor
				.chain()
				.setContent(await markdownToHtml(pane[paneId].buffer))
				.setTextSelection(getPane(paneId)[paneId].cursorPosition)
				.focus()
				.scrollIntoView()
				.blur()
				.run()
		},
		onUpdate: async ({ editor: currentEditor }) => {
			console.log("html:", currentEditor.getHTML());
			const currentPane: PaneNode = getPane(paneId);
			const updatedPane = {
				[paneId]: {
					...currentPane[paneId],
					buffer: await htmlToMarkdown(currentEditor?.getHTML() ?? ""),
				}
			};
			updatePane(updatedPane);
			if (paneId === getActivePane()) {
				updateAllBuffers(currentPane[paneId].fileId, await htmlToMarkdown(editor?.getHTML() ?? ""));
			}
		},
	});

	useEffect(() => {
		if (!editor) return;
		markdownToHtml(pane[paneId].buffer).then((html: string) => {
			editor.commands.setContent(html);
		});
	}, [pane[paneId].bufferVersion, pane[paneId].fileId]);

	useEffect(() => {
		if (activePane === paneId && activePanel === PanelType.MAIN && editor && !getPane(paneId)[paneId].suggestionState.suggestionActive) {
			const handleSpaceKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === ' ') {
					event.preventDefault();
					event.stopImmediatePropagation();
					toggleLeaderPanel();
				}
			};
			document.addEventListener('keydown', handleSpaceKey);

			const handleDashKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === '-') {
					event.preventDefault();
					event.stopImmediatePropagation();
					toggleSidebar()
				}
			};
			document.addEventListener('keydown', handleDashKey);

			const handleJKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'j') {
					event.preventDefault();
					event.stopImmediatePropagation();
					const editorElem = window.document.getElementById(`md-editor-${paneId}`);
					editorElem?.scrollBy(0, 200);
				}
			};
			document.addEventListener('keydown', handleJKey);

			const handleKKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'k') {
					event.preventDefault();
					event.stopImmediatePropagation();
					const editorElem = window.document.getElementById(`md-editor-${paneId}`);
					editorElem?.scrollBy(0, -200);
				}
			};
			document.addEventListener('keydown', handleKKey);

			const handleEscKey = (event: KeyboardEvent) => {
				if (modeRef.current === "INSERT" && event.key === 'Escape') {
					event.preventDefault();
					event.stopImmediatePropagation();
					const { from } = editor.state.selection;
					editor?.chain()
						.setTextSelection({ from: from, to: from + 1 })
						.blur()
						.run();
					setMode("COMMAND");
				}
			};
			document.addEventListener('keydown', handleEscKey);


			return () => {
				document.removeEventListener('keydown', handleSpaceKey);
				document.removeEventListener('keydown', handleDashKey);
				document.removeEventListener('keydown', handleJKey);
				document.removeEventListener('keydown', handleKKey);
				document.removeEventListener('keydown', handleEscKey);
			}
		}
	}, [activePane, editor, activePanel]);

	return (
		<div className={`${activePane === paneId ? "" : "brightness-[82%]"} h-full w-full 
				z-20 bg-background flex`}>
			<div className="flex flex-col justify-between items-center space-y-2 p-2 relative h-full w-full"
				onClick={() => {
					updateActivePane(paneId);
					setActivePanel(PanelType.MAIN);
				}}>
				<div id={`md-editor-${paneId}`}
					className={`no-scrollbar max-w-[1100px] w-full overflow-y-scroll scroll-smooth py-20 flex-1 min-h-0`}>
					<EditorContent editor={editor} onClick={() => {
						if (!editor) return;
						editor?.chain()
							.focus()
							.run();
						setMode("INSERT")
					}} />
				</div>
				<div className={`rounded-sm h-8 flex items-center px-4 pl-8 text-sm font-mono w-full 
					${mode === "COMMAND"
						? "bg-indigo-900 text-white"
						: "bg-orange-900 text-white"
					}`}>
					<span className="font-bold mr-4">-- {mode} --</span>
					{mode === "COMMAND" ? (
						<span className="flex items-center gap-4">
							<span>↑j k↓ move</span>
							<span className="text-blue-200">|</span>
							<span>-: directory sidebar</span>
							<span className="text-blue-200">|</span>
							<span>SPACE: leader menu</span>
						</span>
					) : (
						<span>esc:command mode</span>
					)}
				</div>
			</div>
			{pane[paneId].suggestionState.suggestions && pane[paneId].suggestionState.suggestions.length > 0 && editor &&
				<SuggestionSidebar paneId={paneId}
					view={undefined}
					editor={editor}
					suggestions={pane[paneId].suggestionState.suggestions}
					refocus={(index: number) => {
						const currentPane: PaneNode = getPane(paneId);
						const updatedPane: PaneNode = {
							[paneId]: {
								...currentPane[paneId],
								suggestionState: {
									...currentPane[paneId].suggestionState,
									activeSuggestionIndex: index,
									suggestionActive: true,
								}
							}
						};
						updatePane(updatedPane);
						updateActivePane(paneId);
					}} />
			}
		</div>
	);
}
