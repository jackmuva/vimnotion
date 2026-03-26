import { useEditorStore } from "@/store/editor-store";
import { EditorType, PanelType, PaneNode } from "@/types/editor-types";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import remarkGfm from 'remark-gfm';
import { unified } from 'unified'

import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

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

	const editor = useEditor({
		extensions: [StarterKit, Image],
		content: '<p>Loading...</p>',
		immediatelyRender: false,
		onCreate: async ({ editor: currentEditor }) => {
			const file = await unified()
				.use(remarkParse)
				.use(remarkFrontmatter)
				.use(remarkGfm)
				.use(remarkRehype)
				.use(rehypeStringify)
				.process(pane[paneId].buffer);
			currentEditor.commands.setContent(String(file));
		},
		onUpdate: async ({ editor: currentEditor }) => {
			const file = await unified()
				.use(rehypeParse)
				.use(rehypeRemark)
				.use(remarkStringify)
				.process(currentEditor.getHTML())
			const currentPane: PaneNode = getPane(paneId);
			const updatedPane = {
				[paneId]: {
					...currentPane[paneId],
					buffer: String(file),
				}
			};
			updatePane(updatedPane);
			if (paneId === getActivePane()) {
				updateAllBuffers(currentPane[paneId].fileId, String(file));
			}

		}
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
		const mdElement = document.getElementById(`md-editor-${paneId}`);
		if (!mdElement) return;

		const buffer = pane[paneId].buffer;
		const cursorPos = pane[paneId].cursorPosition;
		const textBeforeCursor = buffer.slice(0, cursorPos);
		const cursorLine = textBeforeCursor.split('\n').length;

		const elementsWithLine = mdElement.querySelectorAll('[data-source-line]');
		let closestElement: Element | null = null;
		let closestLine = 0;

		elementsWithLine.forEach((el) => {
			const line = parseInt(el.getAttribute('data-source-line') || '0', 10);
			if (line <= cursorLine && line > closestLine) {
				closestLine = line;
				closestElement = el;
			}
		});

		if (closestElement !== null) {
			(closestElement as Element).scrollIntoView({ block: 'center', behavior: 'instant' });
		}

	}, [toggleLeaderPanel]);

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
			<h1 className="flex justify-end w-full italic  
				border-b border-b-background-muted/50">
				<button className="flex items-center space-x-1 
					hover:bg-background-muted/50 p-1 cursor-pointer rounded-sm"
					onClick={() => shiftToVim()}>
					<Loader size={15} />
					<div className="text-sm">vim-mode</div>
				</button>
			</h1>
			<div id={`md-editor-${paneId}`}
				className={`no-scrollbar h-full max-w-[1100px] w-full overflow-y-scroll`}>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
