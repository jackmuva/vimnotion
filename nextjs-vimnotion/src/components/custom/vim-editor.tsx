import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { applyCustomVim, customTheme } from './custom-editor-settings';
import { useEditorStore } from '@/store/editor-store';
import { SplitState } from '@/types/editor-types';

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
	const activeId = useEditorStore.getState().activePane;
	const numPanes = useEditorStore.getState().numPanes;
	const updateActivePane = useEditorStore((state) => state.updateActivePane);
	const splitPane = useEditorStore(state => state.splitPane);
	const closePane = useEditorStore(state => state.closePane);
	const focusListener = EditorView.updateListener.of((v) => {
		if (v.view.hasFocus) {
			updateActivePane(paneId);
		}
	});

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
		}
	}, [numPanes, vimEditor]);

	useEffect(() => {
		if (vimEditor && activeId === paneId) {
			vimEditor.focus();
		}
	}, [activeId])

	useEffect(() => {
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#vim-editor-${paneId}`);
		if (!editorElement) {
			return;
		}

		let view = new EditorView({
			doc: "\n\n\n\n\n\n",
			extensions: [
				// make sure vim is included before other keymaps
				vim(),
				basicSetup,
				new Compartment().of(customTheme),
				theme.of(lightTheme),
				markdown(),
				focusListener,
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
			closePane: () => closePane()
		});
		setVimEditor(view);
	}, [isClient]);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
			updateActivePane(paneId);
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

			return () => {
				mediaQuery.removeEventListener('change', handleChange);
			};
		}
	}, [vimEditor]);

	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-background py-1 pr-2'>
			<div id={`vim-editor-${paneId}`}
				className={`h-full w-full overflow-y-scroll`}>
			</div>
		</div>
	)

}
