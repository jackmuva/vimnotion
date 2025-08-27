import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { applyCustomVim, customTheme } from './custom-editor-settings';
import { useStore } from '@/store/store';

export const VimEditor = ({
	paneId,
	toggleSidebar,
	toggleLeaderPanel,
	splitHorizontal,
	splitVertical,
	closePane,
}: {
	paneId: string,
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void,
	splitHorizontal: () => void,
	splitVertical: () => void,
	closePane: () => void,
}) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);
	const activeId = useStore.getState().activePane;
	const updateActivePane = useStore((state) => state.updateActivePane);
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
	}, [activeId, vimEditor]);


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
			splitVertical: splitVertical,
			splitHorizontal: splitHorizontal,
			closePane: closePane,
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
