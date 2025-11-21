import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { applyCustomVim, customTheme } from './custom-editor-settings';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';

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
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
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
		openFileInBuffer } = useEditorStore((state) => state);

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
		if (vimEditor && activeId === paneId && activePanel === PanelType.MAIN) {
			vimEditor.focus();
		}
	}, [activeId, activePanel, directoryConfirmation])

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
		}
		applyCustomVim({
			toggleLeaderPanel: toggleLeaderPanel,
			toggleSidebar: toggleSidebar,
			splitHorizontal: () => splitPane(SplitState.HORIZONTAL),
			splitVertical: () => splitPane(SplitState.VERTICAL),
			closePane: () => closePane(),
			createNewTab: () => createNewTab(),
			nextTab: () => nextTab(),
			prevTab: () => prevTab(),
			getActivePanel: () => getActivePanel(),
			getLocation: () => getLocation(),
			getOilLine: () => getOilLine(),
			setLocation: (loc: string) => setLocation(loc),
			setDirectoryConfirmation: () => setDirectoryConfirmation(true),
			openFileInBuffer: () => openFileInBuffer(),
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
				} else {
					vimEditor?.dispatch({
						effects: theme.reconfigure(lightTheme),
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
