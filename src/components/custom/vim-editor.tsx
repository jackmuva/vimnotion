'use client';
import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState } from 'react';
import { Compartment } from '@codemirror/state';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';
import { markdown } from '@codemirror/lang-markdown';
import { customTheme } from './editor-styling';

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
				// include the default keymap and all other keymaps you want to use in insert mode
				basicSetup,
				themeCompartment.of(customTheme),
				theme,
				markdown(),
			],
			parent: document.querySelector('#vim-editor')!,
		})
		setVimEditor(view);
	}, []);

	return (
		<div id='vim-editor'
			className='w-full h-full overflow-y-scroll p-10'>
		</div>
	)

}
