import { EditorView } from "codemirror";
import { history } from "@codemirror/commands";
import { dropCursor } from "@codemirror/view";
import { useEffect, useRef, useState } from "react";
import { Compartment } from '@codemirror/state';
import { vim } from "@replit/codemirror-vim";
import { customTheme } from '../vim-editor/custom-editor-settings';
import { birdsOfParadise as darkTheme, noctisLilac as lightTheme } from 'thememirror';


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
	}, [vimEditor, theme]);

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
				vim(),
				history(),
				dropCursor(),
				new Compartment().of(customTheme),
				theme.of(lightTheme),
			],
			parent: editorElement,
		});

		if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			view.dispatch({
				effects: theme.reconfigure(darkTheme),
			});
		}
		setVimEditor(view);
	}, [isClient]);


	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-secondary-background'>
			<div id={`sidebar-editor`}
				className={`h-full w-full overflow-y-scroll`}>
			</div>
		</div>

	);
}
