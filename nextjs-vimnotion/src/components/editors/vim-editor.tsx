import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, espresso as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { customTheme, markdownDark, markdownLight } from './vim-editor-theme';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';
import { applyTabBindings } from './extensions/tab-bindings';
import { applySidebarBindings } from './extensions/sidebar-bindings';
import { applyPanelBindings } from './extensions/panel-bindings';
import { syntaxHighlighting } from "@codemirror/language"
import {
	Completion,
	CompletionContext,
	autocompletion,
} from '@codemirror/autocomplete';
import data from '@emoji-mart/data';
import type { EmojiMartData } from '@emoji-mart/data';
import { applyAgentBindings } from './extensions/agent-bindings';
import { DirectoryTree } from '@/types/sidebar-types';

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
		openFileInBuffer, saveVnObjectBuffer, newImageUrl, setNewImageUrl, renderMdTutor, renderVimTutor,
		detectAllDirectoryChanges, getLocationById, newAiBlock, setNewAiBlock, getActivePane,
		updateAllBuffers, setMessageMap, setInputMessageMap, getMessageMap, getInputMessageMap,
		setActivePanel, constructLocationMapHelper, getDirectoryState,
	} = useEditorStore((state) => state);

	const emojiCompletionOptions: Completion[] = useMemo(() => {
		// To prioritize view initialization, generate options after view initialization is complete
		const emojiData = data as EmojiMartData;
		return Object.keys(emojiData.emojis).map((key: string) => {
			return {
				label: `:${key}:`, // String to match with the input text
				displayLabel: key, // String to display in the suggestion list
				detail: emojiData.emojis[key].skins[0].native, // Detailed information to display in the suggestion list (Emoji)
				apply: emojiData.emojis[key].skins[0].native, // String to insert when selected (Emoji)
			};
		});
	}, [vimEditor]);

	const emojiCompletions = useCallback(
		(context: CompletionContext) => {
			const regex = /(?<=(^|\s|\p{Emoji}))(?<!:{2}):[0-9a-zA-Z_\-+]+:{0,1}$/u;
			const word = context.matchBefore(regex);
			if (!word) return null;
			return {
				from: word.from,
				options: emojiCompletionOptions,
				// Reuse candidates as long as the word matches this regular expression
				validFor: /^:[0-9a-zA-Z_\-+]+:{0,1}$/,
			};
		}, [emojiCompletionOptions]);

	const emojiAutocomplete = useMemo(() =>
		autocompletion({
			activateOnTyping: true,
			icons: false,
			override: [emojiCompletions],
		}), [emojiCompletions]);

	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const highlightRef = useRef(new Compartment());
	const highlight = highlightRef.current;

	const focusListener = EditorView.updateListener.of((v) => {
		if (v.view.hasFocus) {
			updateActivePane(paneId);
			const currentPane: PaneNode = getPane(paneId);
			const loc: string | null = getLocationById(currentPane[Object.keys(pane)[0]].fileId);
			if (loc) setLocation(loc);
		}
	});

	const docChangeListener = EditorView.updateListener.of((v) => {
		if (v.docChanged) {
			const currentPane: PaneNode = getPane(paneId);
			const updatedPane = {
				[paneId]: {
					...currentPane[paneId],
					buffer: v.state.doc.toString(),
				}
			};
			updatePane(updatedPane);
			if (paneId === getActivePane()) {
				updateAllBuffers(currentPane[paneId].fileId, v.state.doc.toString());
			}
		}
	});

	const cursorListener = EditorView.updateListener.of((v) => {
		const currentPane: PaneNode = getPane(paneId);
		const updatedPane: PaneNode = { ...currentPane };

		if (v.selectionSet) {
			updatedPane[paneId].cursorPosition = v.view.state.selection.ranges[0].from;
		}
		updatePane(updatedPane);
	});

	useEffect(() => {
		if (vimEditor) {
			vimEditor.dispatch({
				changes: {
					from: 0,
					to: vimEditor.state.doc.length,
					insert: pane[paneId].buffer,
				},
			});
			vimEditor.dispatch({
				selection: {
					anchor: pane[paneId].cursorPosition,
					head: pane[paneId].cursorPosition,
				},
			});
			vimEditor.scrollDOM.scrollTop = pane[paneId].scrollPosition;
		}
	}, [pane[paneId].fileId, pane[paneId].bufferVersion, getPane]);

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
			if (newImageUrl) {
				const mdImage = `![your-image-name](${newImageUrl})`
				const cursorPosition: number = vimEditor.state.selection.main.head;
				const transaction = vimEditor.state.update({
					changes: {
						from: cursorPosition,
						insert: mdImage,
					},
					selection: { anchor: cursorPosition + 1 },
					scrollIntoView: true,
				});
				if (transaction) {
					vimEditor.dispatch(transaction);
				}
				setNewImageUrl("");
			} else if (newAiBlock) {
				const cursorPosition: number = vimEditor.state.selection.main.head;
				const transaction = vimEditor.state.update({
					changes: {
						from: cursorPosition,
						insert: newAiBlock,
					},
					selection: { anchor: cursorPosition + 1 },
					scrollIntoView: true,
				});
				if (transaction) {
					vimEditor.dispatch(transaction);
				}
				setNewAiBlock("");
			}
		}
	}, [activeId, activePanel, directoryConfirmation, newImageUrl, newAiBlock, setNewAiBlock, setNewImageUrl])

	useEffect(() => {
		setActivePanel(PanelType.MAIN);
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
				customTheme,
				vim(),
				basicSetup,
				theme.of(lightTheme),
				highlight.of(syntaxHighlighting(markdownLight)),
				markdown(),
				focusListener,
				docChangeListener,
				cursorListener,
				EditorView.lineWrapping,
				emojiAutocomplete,
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
			setLocation: (loc: string) => setLocation(loc),
		});
		applyPanelBindings({
			setDirectoryConfirmation: () => setDirectoryConfirmation(true),
			splitHorizontal: () => splitPane(SplitState.HORIZONTAL),
			splitVertical: () => splitPane(SplitState.VERTICAL),
			closePane: () => closePane(),
			getActivePanel: () => getActivePanel(),
			saveVnObjectBuffer: () => saveVnObjectBuffer(),
			toggleSidebar: toggleSidebar,
			renderMdTutor: () => renderMdTutor(),
			renderVimTutor: () => renderVimTutor(),
			refetchFileInBuffer: (fileId: string) => openFileInBuffer(fileId),
			getActivePane: () => getActivePane(),
			getPane: (paneId: string) => getPane(paneId),
		});
		applyAgentBindings({
			setMessageMap: (messageMap): void => setMessageMap(messageMap),
			setInputMessageMap: (inputMap) => setInputMessageMap(inputMap),
			getActivePane: () => getActivePane(),
			getActivePanel: () => getActivePanel(),
			getMessageMap: () => getMessageMap(),
			getInputMessageMap: () => getInputMessageMap(),
			getDirectoryState: () => getDirectoryState(),
			getLocationMap: (directoryState: DirectoryTree): {
				[uuid: string]: {
					location: string;
					name: string;
					isFile: boolean;
				};
			} => constructLocationMapHelper(directoryState),
			getOilLine: () => getOilLine(),
			openFileInBuffer: () => openFileInBuffer(),
			detectAllDirectoryChanges: () => detectAllDirectoryChanges(),
			setDirectoryConfirmation: () => setDirectoryConfirmation(true),
			toggleSidebar: toggleSidebar,
			getLocation: () => getLocation(),
			setLocation: (loc: string) => setLocation(loc),
		});
		setVimEditor(view);

		const handleScroll = () => {
			const currentPane: PaneNode = getPane(paneId);
			const updatedPane: PaneNode = {
				[paneId]: {
					...currentPane[paneId],
					scrollPosition: view.scrollDOM.scrollTop,
				}
			};
			updatePane(updatedPane);
		}
		view.scrollDOM.addEventListener("scroll", handleScroll);

		const currentPane: PaneNode = getPane(paneId);
		view.dispatch({
			selection: {
				anchor: currentPane[paneId].cursorPosition,
				head: currentPane[paneId].cursorPosition,
			},
		});
		view.scrollDOM.scrollTop = currentPane[paneId].scrollPosition;

		return () => {
			view.scrollDOM.removeEventListener("scroll", handleScroll)
		}
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
				className={`no-scrollbar h-full w-full`}>
			</div>
		</div>
	);
}
