import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { customTheme, markdownDark, markdownLight } from './vim-editor-theme';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';
import { applyTabBindings } from './extensions/tab-bindings';
import { applySidebarBindings } from './extensions/sidebar-bindings';
import { applyPanelBindings } from './extensions/panel-bindings';
import { syntaxHighlighting } from "@codemirror/language"

export const VimEditor = ({
	paneId,
	toggleSidebar,
	toggleLeaderPanel,
}: {
	paneId: string,
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void,
}) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const [isClient, setIsClient] = useState(false);

	const activeId: string = useEditorStore((state) => state.activePane);
	const activePanel: PanelType = useEditorStore((state) => state.activePanel);
	const getActivePanel: () => PanelType = useEditorStore((state) => state.getActivePanel);
	const updateActivePane = useEditorStore((state) => state.updateActivePane);
	const splitPane = useEditorStore(state => state.splitPane);
	const closePane = useEditorStore(state => state.closePane);
	const createNewTab = useEditorStore(state => state.createNewTab);
	const nextTab = useEditorStore(state => state.nextTab);
	const prevTab = useEditorStore(state => state.prevTab);
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const updatePane = useEditorStore((state) => state.updatePane);
	const directoryConfirmation: boolean = useEditorStore((state) => state.directoryConfirmation);
	const pane: PaneNode = getPane(paneId);
	const { getLocation, setLocation, getOilLine, setDirectoryConfirmation,
		openFileInBuffer, updateVnObject, newImageUrl, setNewImageUrl, } = useEditorStore((state) => state);

	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const highlightRef = useRef(new Compartment());
	const highlight = highlightRef.current;

	const focusListener = EditorView.updateListener.of((v) => {
		if (v.view.hasFocus) {
			updateActivePane(paneId);
		}
	});

	const docChangeListener = EditorView.updateListener.of((v) => {
		if (v.docChanged) {
			const currentPane = getPane(paneId);
			const updatedPane = {
				[paneId]: {
					...currentPane[paneId],
					buffer: v.state.doc.toString(),
				}
			};
			updatePane(updatedPane);
		}
	});

	useEffect(() => {
		vimEditor?.dispatch({
			changes: {
				from: 0,
				to: vimEditor?.state.doc.length,
				insert: pane[paneId].buffer,
			},
		});
	}, [pane[paneId].fileId]);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
		}
	}, [vimEditor]);

	useEffect(() => {
		console.log('refocusing');
		if (vimEditor && activeId === paneId && activePanel === PanelType.MAIN) {
			console.log('focus');
			vimEditor.focus();
			if (newImageUrl) {
				const mdImage = `![your-image-name](${newImageUrl})`
				const cursorPosition: number = vimEditor.state.selection.main.head;
				vimEditor.dispatch({
					changes: {
						from: cursorPosition,
						to: cursorPosition + mdImage.length,
						insert: mdImage,
					}
				});
				setNewImageUrl("");
			}
		}
	}, [activeId, activePanel, directoryConfirmation, newImageUrl, setNewImageUrl])

	useEffect(() => {
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#vim-editor-${paneId}`);
		if (!editorElement) {
			return;
		}

		const view = new EditorView({
			doc: pane[paneId].buffer,
			extensions: [
				// make sure vim is included before other keymaps
				customTheme,
				vim(),
				basicSetup,
				theme.of(lightTheme),
				highlight.of(syntaxHighlighting(markdownLight)),
				markdown(),
				focusListener,
				docChangeListener,
				EditorView.lineWrapping,
			],
			parent: editorElement,
		});

		if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			view.dispatch({
				effects: theme.reconfigure(darkTheme),
			});
			view.dispatch({
				effects: highlight.reconfigure(syntaxHighlighting(markdownDark)),
			});
		}
		applyTabBindings({
			createNewTab: () => createNewTab(),
			nextTab: () => nextTab(),
			prevTab: () => prevTab(),
			getActivePanel: () => getActivePanel(),
		});
		applySidebarBindings({
			toggleLeaderPanel: toggleLeaderPanel,
			toggleSidebar: toggleSidebar,
			getActivePanel: () => getActivePanel(),
			getLocation: () => getLocation(),
			getOilLine: () => getOilLine(),
			setLocation: (loc: string) => setLocation(loc),
			openFileInBuffer: () => openFileInBuffer(),

		});
		applyPanelBindings({
			setDirectoryConfirmation: () => setDirectoryConfirmation(true),
			splitHorizontal: () => splitPane(SplitState.HORIZONTAL),
			splitVertical: () => splitPane(SplitState.VERTICAL),
			closePane: () => closePane(),
			getActivePanel: () => getActivePanel(),
			updateVnObject: () => updateVnObject(),
			toggleSidebar: toggleSidebar,
		});
		setVimEditor(view);
	}, [isClient]);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
			updateActivePane(paneId);
		}

		if (typeof window !== 'undefined' && vimEditor) {
			const handleBeforeUnload = (event: BeforeUnloadEvent) => {
				event.preventDefault();
				event.returnValue = "";
			};

			window.addEventListener("beforeunload", handleBeforeUnload);

			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = (event: MediaQueryListEvent) => {
				if (event.matches) {
					vimEditor?.dispatch({
						effects: theme.reconfigure(darkTheme),
					});
					vimEditor.dispatch({
						effects: highlight.reconfigure(syntaxHighlighting(markdownDark)),
					});
				} else {
					vimEditor?.dispatch({
						effects: theme.reconfigure(lightTheme),
					});
					vimEditor.dispatch({
						effects: highlight.reconfigure(syntaxHighlighting(markdownLight)),
					});
				}
			};
			mediaQuery.addEventListener('change', handleChange);

			return () => {
				mediaQuery.removeEventListener('change', handleChange);
				window.removeEventListener("beforeunload", handleBeforeUnload);
			};
		}
	}, [vimEditor, paneId, theme, updateActivePane]);

	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-background'>
			<div id={`vim-editor-${paneId}`}
				className={`h-full w-full overflow-y-scroll`}>
			</div>
		</div>
	);
}
