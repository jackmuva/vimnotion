import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState, useRef } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { applyCustomVim, customTheme } from './custom-editor-settings';
import { LeaderPanel } from './leader-panel';

export const VimEditor = ({ toggleSidebar }:
	{ toggleSidebar: () => void }) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [leaderPanel, setLeaderPanel] = useState<boolean>(false);

	const toggleLeaderPanel = () => {
		setLeaderPanel((prev) => !prev);
	}
	useEffect(() => {
		if (leaderPanel) {
			// Focus the button after the component has rendered
			const button = document.getElementById('first-leader-option');
			if (button) {
				button.focus();
			}
		}
	}, [leaderPanel]);

	useEffect(() => {
		if (vimEditor !== null) {
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
			],
			parent: document.querySelector('#vim-editor')!,
		});

		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			view.dispatch({
				effects: theme.reconfigure(darkTheme),
			});
		}
		applyCustomVim({ toggleLeaderPanel: toggleLeaderPanel, toggleSidebar: toggleSidebar });
		setVimEditor(view);
	}, []);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
		}

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			if (event.matches) {
				vimEditor?.dispatch({
					effects: theme.reconfigure(darkTheme),
				});
			} else {
				vimEditor?.dispatch({
					effects: theme.reconfigure(lightTheme),
				});
			}
		});
	}, [vimEditor]);

	return (
		<div className='relative h-full w-full '>
			<div className='w-full h-full relative'>
				<div id='vim-editor'
					className={`${leaderPanel ? "h-3/4" : "h-full"} w-full overflow-y-scroll relative`}>
				</div>
				{leaderPanel && <LeaderPanel />}
			</div>
		</div>
	)

}
