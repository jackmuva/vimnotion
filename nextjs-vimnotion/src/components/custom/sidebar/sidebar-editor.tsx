import { basicSetup, EditorView } from "codemirror";
import { useEffect, useRef, useState } from "react";
import { Compartment } from '@codemirror/state';
import { vim } from "@replit/codemirror-vim";
import { customTheme } from '../vim-editor/custom-editor-settings';
import { bespin as darkTheme, rosePineDawn as lightTheme } from 'thememirror';


export const SidebarEditor = ({

}: {

	}) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (vimEditor) {
			vimEditor.focus();
		}
	}, [vimEditor]);

	useEffect(() => {
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#sidebar-editor`);
		if (!editorElement) {
			return;
		}

		const view = new EditorView({
			doc: "hi\n\n",
			extensions: [
				// make sure vim is included before other keymaps
				vim(),
				basicSetup,
				new Compartment().of(customTheme),
				theme.of(darkTheme),
			],
			parent: editorElement,
		});

		if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			view.dispatch({
				effects: theme.reconfigure(lightTheme),
			});
		}
		setVimEditor(view);
	}, [isClient]);


	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-background'>
			<div id={`sidebar-editor`}
				className={`h-full w-full overflow-y-scroll`}>
			</div>
		</div>

	);
}
