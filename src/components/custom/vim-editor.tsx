'use client';
import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { vim, getCM, Vim, CodeMirror } from "@replit/codemirror-vim"
import { useEffect, useState } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { customTheme, customKeyMappings } from './custom-editor-settings';

export const VimEditor = () => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeCompartment = new Compartment();

	useEffect(() => {
		if (vimEditor !== null) {
			return;
		}

		let theme = lightTheme;
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = darkTheme
		}

		let view = new EditorView({
			doc: "",
			extensions: [
				// make sure vim is included before other keymaps
				vim(),
				basicSetup,
				themeCompartment.of(customTheme),
				theme,
				markdown(),
				keymap.of(customKeyMappings),
			],
			parent: document.querySelector('#vim-editor')!,
		})
		let cm = getCM(view);
		Vim.defineEx('write', 'w', function() {
			console.log('saving');
		});
		Vim.defineAction("toggleLeaderPanel", (args) => {
			console.log('toggling');
		});
		Vim.unmap('<Space>', "false");
		Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', { cm: cm, args: [] }, { context: 'normal' });
		setVimEditor(view);
	}, []);

	return (
		<div id='vim-editor'
			className='w-full h-full overflow-y-scroll p-10'>
		</div>
	)

}
