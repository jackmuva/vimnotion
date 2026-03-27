import { useEditorStore } from "@/store/editor-store";
import { EditorType, PanelType, PaneNode } from "@/types/editor-types";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { htmlToMarkdown, markdownToHtml } from "@/lib/utils";
import { ResolvedPos } from "@tiptap/pm/model";

export const MarkdownEditor = ({
	paneId
}: {
	paneId: string,
}) => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePane);
	const pane: PaneNode = getPane(paneId);
	const activePane: string = useEditorStore((state) => state.activePane);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const toggleSidebar = useEditorStore((state) => state.toggleSidebar);
	const updateActivePane = useEditorStore((state) => state.updateActivePane);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);
	const updateAllBuffers = useEditorStore((state) => state.updateAllBuffers);
	const getActivePane = useEditorStore((state) => state.getActivePane);

	const [mode, setMode] = useState<"COMMAND" | "INSERT">("COMMAND");
	const modeRef = useRef<"COMMAND" | "INSERT">("COMMAND");
	const prevCursorPosRef = useRef<number>(0);
	const columnPosRef = useRef<number | null>(null); // Preserve column position for j/k navigation

	useEffect(() => {
		modeRef.current = mode;
	}, [mode])

	const moveCursorWithHighlight = (newPos: number) => {
		if (!editor) return;
		const prevPos = prevCursorPosRef.current || 1;
		editor.chain()
			.setTextSelection({ from: prevPos, to: prevPos + 1 })
			.unsetHighlight()
			.setTextSelection({ from: newPos, to: newPos + 1 })
			.toggleHighlight({ color: "#818cf8" })
			.blur()
			.run();
		prevCursorPosRef.current = newPos;
	};

	const findTargetPosInBlock = (doc: any, blockPos: number, desiredOffset: number): number => {
		const $block = doc.resolve(blockPos);
		const blockStart = $block.start($block.depth);
		const blockEnd = $block.end($block.depth);

		// Clamp to block bounds
		return Math.min(blockStart + desiredOffset, blockEnd);
	};

	const editor = useEditor({
		extensions: [StarterKit, Image, Highlight.configure({ multicolor: true })],
		content: '<p>Loading...</p>',
		immediatelyRender: false,
		onCreate: async ({ editor: currentEditor }) => {
			currentEditor
				.chain()
				.setContent(await markdownToHtml(pane[paneId].buffer))
				.run()

			// Initialize cursor at position 1 and highlight
			prevCursorPosRef.current = 1;
			currentEditor.chain()
				.setTextSelection({ from: 1, to: 3 })
				.toggleHighlight({ color: "#818cf8" })
				.blur()
				.run();
		},
		onUpdate: async ({ editor: currentEditor }) => {
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
		onSelectionUpdate: ({ editor: currentEditor }) => {
			const { from } = currentEditor.state.selection;
			const currentPane = getPane(paneId);
			const updatedPane = {
				[paneId]: {
					...currentPane[paneId],
					cursorPosition: from,
				}
			};
			updatePane(updatedPane);
		},
	})

	useEffect(() => {
		if (!editor) return;
		markdownToHtml(pane[paneId].buffer).then((html: string) => {
			editor.commands.setContent(html);
		});
	}, [pane[paneId].bufferVersion, pane[paneId].fileId]);

	useEffect(() => {
		if (activePane === paneId && editor) {
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

					const { from } = editor.state.selection;
					const doc = editor.state.doc;
					const pos = doc.resolve(from);

					// Calculate current character offset within block
					const blockStart = pos.start(pos.depth);
					const charOffset = from - blockStart;

					// Use stored column or current offset (Vim behavior - preserve original column)
					const desiredOffset = columnPosRef.current ?? charOffset;
					columnPosRef.current = desiredOffset;

					// Find next block
					const nextBlockPos = pos.after(pos.depth);

					// Edge case: already at last block
					if (nextBlockPos >= doc.content.size) {
						return; // Do nothing
					}

					// Calculate target position in next block
					const targetPos = findTargetPosInBlock(doc, nextBlockPos, desiredOffset);

					moveCursorWithHighlight(targetPos);
				}
			};
			document.addEventListener('keydown', handleJKey);

			const handleKKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'k') {
					event.preventDefault();
					event.stopImmediatePropagation();

					const { from } = editor.state.selection;
					const doc = editor.state.doc;
					const pos: ResolvedPos = doc.resolve(from);

					// Calculate current character offset within block
					const blockStart = pos.start(pos.depth);
					const charOffset = from - blockStart;

					// Use stored column or current offset (Vim behavior - preserve original column)
					const desiredOffset = columnPosRef.current ?? charOffset;
					columnPosRef.current = desiredOffset;

					// Find previous block
					const prevBlockPos = pos.before(pos.depth);

					// Edge case: already at first block
					if (prevBlockPos <= 0) {
						return; // Do nothing
					}

					// Calculate target position in previous block
					const targetPos = findTargetPosInBlock(doc, prevBlockPos, desiredOffset);

					moveCursorWithHighlight(targetPos);
				}
			};
			document.addEventListener('keydown', handleKKey);

			const handleIKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'i') {
					event.preventDefault();
					event.stopImmediatePropagation();
					columnPosRef.current = null; // Reset column tracking on mode change
					const pos = prevCursorPosRef.current || 1;
					editor?.chain()
						.setTextSelection({ from: pos, to: pos + 1 })
						.unsetHighlight()
						.setTextSelection(pos)
						.focus()
						.run();
					setMode("INSERT");
				}
			};
			document.addEventListener('keydown', handleIKey);

			const handleLKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'l') {
					event.preventDefault();
					event.stopImmediatePropagation();
					columnPosRef.current = null; // Reset column tracking on horizontal movement
					const { from } = editor.state.selection;
					const docLength = editor.state.doc.content.size;
					if (from < docLength - 1) {
						moveCursorWithHighlight(from + 1);
					}
				}
			};
			document.addEventListener('keydown', handleLKey);

			const handleHKey = (event: KeyboardEvent) => {
				if (modeRef.current === "COMMAND" && event.key === 'h') {
					event.preventDefault();
					event.stopImmediatePropagation();
					columnPosRef.current = null; // Reset column tracking on horizontal movement
					const { from } = editor.state.selection;
					if (from > 1) {
						moveCursorWithHighlight(from - 1);
					}
				}
			};
			document.addEventListener('keydown', handleHKey);

			const handleEscKey = (event: KeyboardEvent) => {
				if (modeRef.current === "INSERT" && event.key === 'Escape') {
					event.preventDefault();
					event.stopImmediatePropagation();
					const { from } = editor.state.selection;
					prevCursorPosRef.current = from;
					editor?.chain()
						.setTextSelection({ from: from, to: from + 1 })
						.toggleHighlight({ color: "#818cf8" })
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
				document.removeEventListener('keydown', handleIKey);
				document.removeEventListener('keydown', handleHKey);
				document.removeEventListener('keydown', handleLKey);
				document.removeEventListener('keydown', handleEscKey);
			}
		}
	}, [activePane, editor]);

	return (
		<div className={`${activePane === paneId ? "" : "brightness-[82%]"} relative h-full w-full 
				z-20 bg-background flex flex-col justify-start items-center space-y-2 p-2`}
			onClick={() => {
				updateActivePane(paneId);
				setActivePanel(PanelType.MAIN);
			}}>
			<div id={`md-editor-${paneId}`}
				className={`no-scrollbar h-full max-w-[1100px] w-full overflow-y-scroll`}>
				<EditorContent editor={editor} onClick={() => {
					if (!editor) return;
					const { from } = editor.state.selection;
					editor?.chain()
						.setTextSelection({
							from: prevCursorPosRef.current,
							to: prevCursorPosRef.current + 1
						})
						.unsetHighlight()
						.setTextSelection(from)
						.focus()
						.run();
					prevCursorPosRef.current = from;
					setMode("INSERT")
				}} />
			</div>
			<div className={`absolute rounded-sm bottom-0 left-0 right-0 h-8 flex items-center px-4 text-sm font-mono border-t 
					${mode === "COMMAND"
					? "bg-indigo-700 text-white border-indigo-900"
					: "bg-orange-700 text-white border-orange-900"
				}`}>
				<span className="font-bold mr-4">-- {mode} --</span>
				{mode === "COMMAND" ? (
					<span className="flex items-center gap-4">
						<span>←h l→ move cursor</span>
						<span className="text-blue-200">|</span>
						<span>↑j k↓ move</span>
						<span className="text-blue-200">|</span>
						<span>i:insert</span>
						<span className="text-blue-200">|</span>
						<span>-:sidebar</span>
					</span>
				) : (
					<span>esc:command mode</span>
				)}
			</div>
		</div>
	);
}
