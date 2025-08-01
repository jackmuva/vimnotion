'use client';
import { basicSetup, EditorView } from 'codemirror';
import { vim } from "@replit/codemirror-vim"
import { useEffect, useState } from 'react';
import { Compartment } from '@codemirror/state';
import { customTheme } from './editor-styling';

export const VimEditor = () => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeCompartment = new Compartment();

	useEffect(() => {
		if (vimEditor !== null) {
			return;
		}


		let view = new EditorView({
			doc: "",
			extensions: [
				// make sure vim is included before other keymaps
				vim(),
				// include the default keymap and all other keymaps you want to use in insert mode
				basicSetup,
				themeCompartment.of(customTheme) // Apply initial theme
			],
			parent: document.querySelector('#vim-editor')!,
		})
		setVimEditor(view);
	}, []);

	return (
		<div id='vim-editor'
			className='w-11/12 h-11/12 bg-slate-700 rounded-sm 
			p-1 overflow-y-scroll'>

		</div>
	)

}
