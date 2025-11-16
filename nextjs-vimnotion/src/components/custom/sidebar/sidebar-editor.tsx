import {
	EditorView,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	highlightActiveLine,
	keymap
} from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { useEffect, useRef, useState } from "react";
import { Compartment } from '@codemirror/state';
import { vim } from "@replit/codemirror-vim";
import { customTheme } from '../vim-editor/custom-editor-settings';
import { birdsOfParadise as darkTheme, noctisLilac as lightTheme } from 'thememirror';
import { DirectoryTree } from "@/types/sidebar-types";
import { useEditorStore } from "@/store/editor-store";


export const SidebarEditor = () => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);
	const { location, setOilLine, directoryState, pushSidebarBufferHistory, setSidebarBufferMap,
		editingDirectory, proposedDirectoryState, evaluateOilBufferChanges, directoryConfirmation } = useEditorStore((state) => state);

	const bufferChangeListener: Extension = EditorView.updateListener.of((v) => {
		if (v.docChanged) {
			pushSidebarBufferHistory(v.state.doc.toString());
			evaluateOilBufferChanges();
		}
	});

	const getSidebarBuffer = (locArr: Array<string>, dir: DirectoryTree) => {
		let curDir: DirectoryTree = dir;
		for (const loc of locArr) {
			if (loc && curDir[loc + "/"].children !== undefined) {
				curDir = curDir[loc + "/"].children;
			}
		}
		const bufferMap: { [id: string]: string } = {};
		for (const fn of Object.keys(curDir)) {
			bufferMap[fn.split("|")[1]] = fn;
		}
		setSidebarBufferMap(bufferMap);
		const buffer = Object.keys(bufferMap).join("\n") + "\n\n\n";
		pushSidebarBufferHistory(buffer)
		return buffer;
	}

	const cursorChangeListener = EditorView.updateListener.of((v) => {
		if (v.state.selection) {
			const pos = v.state.selection.ranges[0].to;
			const lines = v.state.doc.toString().split("\n");
			let res = "";
			let cur = 0;
			for (const line of lines) {
				if (cur <= pos && (cur + line.length) >= pos) {
					res = line;
					break;
				}
				cur += (line.length + 1);
			}
			setOilLine(res);
		}
	});

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
	}, [vimEditor, theme, directoryConfirmation]);

	useEffect(() => {
		if (!isClient || vimEditor === null) {
			return;
		}
		const newContent = getSidebarBuffer(location.split("/"), editingDirectory ? proposedDirectoryState : directoryState);
		vimEditor.dispatch({
			changes: {
				from: 0,
				to: vimEditor.state.doc.length,
				insert: newContent
			}
		});
	}, [directoryState, location, isClient, vimEditor]);

	useEffect(() => {
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#sidebar-editor`);
		if (!editorElement) {
			return;
		}

		const view = new EditorView({
			doc: getSidebarBuffer(location.split("/"), editingDirectory ? proposedDirectoryState : directoryState),
			extensions: [
				customTheme,
				vim(),
				highlightActiveLineGutter(),
				highlightSpecialChars(),
				history(),
				foldGutter(),
				drawSelection(),
				dropCursor(),
				EditorState.allowMultipleSelections.of(true),
				indentOnInput(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				rectangularSelection(),
				crosshairCursor(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...foldKeymap,
					...completionKeymap,
					...lintKeymap
				]),
				theme.of(lightTheme),
				cursorChangeListener,
				bufferChangeListener,
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
