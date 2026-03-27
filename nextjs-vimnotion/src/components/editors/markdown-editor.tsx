import { useEditorStore } from "@/store/editor-store";
import { EditorType, PanelType, PaneNode } from "@/types/editor-types";
import { Loader } from "lucide-react";
import { useEffect } from "react";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { htmlToMarkdown, markdownToHtml } from "@/lib/utils";

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

	//BUG:The cursor position definitely doesnt work
	const editor = useEditor({
		extensions: [StarterKit, Image],
		content: '<p>Loading...</p>',
		immediatelyRender: false,
		onCreate: async ({ editor: currentEditor }) => {
			const parser = new DOMParser();
			let numChars: number = 0;
			let curLine: string = "";
			for (const line of pane[paneId].buffer.split("\n")) {
				const curPos: number = pane[paneId].cursorPosition;
				if (curPos >= numChars && curPos <= (numChars + line.length)) {
					curLine = line;
					break;
				} else {
					numChars += line.length
				}
			}

			const lineText = parser.parseFromString(await markdownToHtml(curLine), 'text/html');
			const docText = parser.parseFromString(await markdownToHtml(pane[paneId].buffer), 'text/html');

			currentEditor
				.chain()
				.setContent(await markdownToHtml(pane[paneId].buffer))
				.setTextSelection(docText.body.textContent.indexOf(lineText.body.textContent))
				.focus()
				.selectTextblockStart()
				.scrollIntoView()
				.run()
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

	const shiftToVim = (): void => {
		const updateNode: PaneNode = {
			[paneId]: {
				...pane[paneId],
				editorType: EditorType.VIM,
			},
		};
		updatePane(updateNode);
	}

	useEffect(() => {
		if (!editor) return;
		markdownToHtml(pane[paneId].buffer).then((html: string) => {
			editor.commands.setContent(html);
		});
	}, [pane[paneId].bufferVersion, pane[paneId].fileId]);

	useEffect(() => {
		if (activePane === paneId) {
			const handleSpaceKey = (event: KeyboardEvent) => {
				if (event.key === ' ') {
					event.preventDefault();
					event.stopImmediatePropagation();
					toggleLeaderPanel();
				}
			};
			document.addEventListener('keydown', handleSpaceKey);

			const handleDashKey = (event: KeyboardEvent) => {
				if (event.key === '-') {
					event.preventDefault();
					event.stopImmediatePropagation();
					toggleSidebar()
				}
			};
			document.addEventListener('keydown', handleDashKey);


			return () => {
				document.removeEventListener('keydown', handleSpaceKey);
				document.removeEventListener('keydown', handleDashKey);
			}
		}
	}, [activePane]);

	return (
		<div className={`${activePane === paneId ? "" : "brightness-[82%]"} relative h-full w-full 
				z-20 bg-background flex flex-col justify-start items-center space-y-2 p-2`}
			onClick={() => {
				updateActivePane(paneId);
				setActivePanel(PanelType.MAIN);
			}}>
			<div id={`md-editor-${paneId}`}
				className={`no-scrollbar h-full max-w-[1100px] w-full overflow-y-scroll`}>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
