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
import { customTheme } from "../editors/vim-editor-theme";
import { birdsOfParadise as darkTheme, noctisLilac as lightTheme } from 'thememirror';
import { DirectoryTree } from "@/types/sidebar-types";
import { useEditorStore } from "@/store/editor-store";
import { EclipseIcon, EllipsisIcon, FilePenIcon, FolderClosedIcon, SaveIcon, TrashIcon } from "lucide-react";


export const SidebarEditor = () => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
	const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
	const location = useEditorStore((state) => state.location);
	const setOilLine = useEditorStore((state) => state.setOilLine);
	const directoryState = useEditorStore((state) => state.directoryState);
	const pushSidebarBufferHistory = useEditorStore((state) => state.pushSidebarBufferHistory);
	const setSidebarBufferMap = useEditorStore((state) => state.setSidebarBufferMap);
	const editingDirectory = useEditorStore((state) => state.editingDirectory);
	const proposedDirectoryState = useEditorStore((state) => state.proposedDirectoryState);
	const evaluateOilBufferChanges = useEditorStore((state) => state.evaluateOilBufferChanges);
	const directoryConfirmation = useEditorStore((state) => state.directoryConfirmation);
	const setDirectoryConfirmation = useEditorStore((state) => state.setDirectoryConfirmation);
	const dirCursorPosition = useEditorStore((state) => state.dirCursorPosition);
	const setDirCursorPosition = useEditorStore((state) => state.setDirCursorPosition);

	const bufferChangeListener: Extension = EditorView.updateListener.of((v) => {
		if (v.docChanged) {
			pushSidebarBufferHistory(v.state.doc.toString());
			evaluateOilBufferChanges();
		}
	});

	const getSidebarBuffer = (locArr: Array<string>, dir: DirectoryTree, setting: boolean = true) => {
		let curDir: DirectoryTree = dir;
		for (const loc of locArr) {
			if (!loc) continue;
			if (loc && curDir[loc + "/"] && curDir[loc + "/"].children) {
				curDir = curDir[loc + "/"].children;
			}
		}
		const bufferMap: { [id: string]: string } = {};
		for (const fn of Object.keys(curDir)) {
			bufferMap[fn.split("|")[1]] = fn;
		}

		const buffer = Object.keys(bufferMap).join("\n") + "\n\n\n";
		if (setting) {
			setSidebarBufferMap(bufferMap);
			pushSidebarBufferHistory(buffer);
		}
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

			if (v.view.state.selection.ranges[0].from !== 0 && dirCursorPosition !== v.view.state.selection.ranges[0].from) {
				setDirCursorPosition(v.view.state.selection.ranges[0].from);
			}
		}
	});

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (openMenuId === null) return;

		const handleClickOutside = (e: MouseEvent) => {
			const menuEl = menuRefs.current[openMenuId];
			const buttonEl = buttonRefs.current[openMenuId];
			const target = e.target as Node;

			if (menuEl && buttonEl && !menuEl.contains(target) && !buttonEl.contains(target)) {
				setOpenMenuId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [openMenuId]);

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
		vimEditor.dispatch({
			selection: {
				anchor: dirCursorPosition > vimEditor.state.doc.length ?
					vimEditor.state.doc.length :
					dirCursorPosition,
				head: dirCursorPosition > vimEditor.state.doc.length ?
					vimEditor.state.doc.length :
					dirCursorPosition,
			},
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

	const insertNew = (name: string) => {
		let lastI = 0;
		if (vimEditor?.state.doc) {
			for (let i = vimEditor?.state.doc.toString().length - 1; i >= 0; i--) {
				if (vimEditor?.state.doc.toString()[i] !== "\n") {
					lastI = i;
					break;
				}
			}
		}
		vimEditor?.dispatch({
			changes: {
				from: lastI + 1,
				insert: `\n${name}`
			}
		});
	}

	const deleteLine = (lineNum: number) => {
		let charCount = 0;
		if (vimEditor?.state.doc) {
			const lineArray = vimEditor?.state.doc.toString().split("\n")
			for (let i = 0; i < lineNum; i++) {
				charCount += lineArray[i].length;
			}

			vimEditor?.dispatch({
				changes: {
					from: charCount,
					to: charCount + lineArray[lineNum].length,
					insert: "",
				}
			});
		}
	}

	return (
		<div className='flex flex-col gap-2 relative h-full w-full rounded-sm z-20 '>
			<div className="flex gap-2 justify-center items-center px-2">
				<div low-data-tooltip="&quot;i&quot; to go into insert mode, type the file name on a new line"
					className="text-sm flex-1 font-robo-mono">
					<button className="font-robo-mono w-full border border-foreground-muted/50 rounded-sm px-2 py-1 flex gap-1 items-center
					justify-center"
						onClick={() => insertNew("new-file")}>
						<FilePenIcon size={16} className="text-foreground/90" />
						<span className="text-xs">new file</span>
					</button>
				</div>
				<div low-data-tooltip="&quot;i&quot; to go into insert mode, type the directory name on a new line ending with a &quot;/&quot;"
					className="text-sm flex-1 font-robo-mono">
					<button className="font-robo-mono w-full border border-foreground-muted/50 rounded-sm px-2 py-1 flex gap-1 items-center
					justify-center"
						onClick={() => insertNew("new-directory/")}>
						<FolderClosedIcon size={16} className="text-foreground/90" />
						<span className="text-xs">new dir</span>
					</button>
				</div>
				<div low-data-tooltip="&quot;:w&quot; to save changes"
					className="text-sm flex-1 font-robo-mono">
					<button className="bg-foreground/20 font-robo-mono w-full border border-foreground-muted/50 rounded-sm px-2 py-1 flex gap-1 items-center
					justify-center"
						onClick={() => setDirectoryConfirmation(true)}>
						<SaveIcon size={16} className="text-foreground/90" />
						<span className="text-xs">save</span>
					</button>
				</div>
			</div>
			<div className="flex w-full">
				<div id={`sidebar-editor`}
					right-data-tooltip="<Enter> to open a file or directory. &quot;-&quot; to go back a directory"
					className={`flex-1 text-sm font-robo-mono h-fit w-full overflow-y-scroll bg-transparent no-scrollbar`}>
				</div>
				<div className="flex flex-col gap-0 pt-1">
					{getSidebarBuffer(location.split("/"), editingDirectory ? proposedDirectoryState : directoryState, false).split("\n").filter((line) => line.trim() !== "").map((_, i) => {
						return (
							<div key={i} className="relative">
								<button ref={(el) => {
									if (el) buttonRefs.current[i] = el;
								}}
									className="bg-foreground-muted/10 rounded-sm hover:bg-foreground-muted/20 transition-colors"
									onClick={() => setOpenMenuId(openMenuId === i ? null : i)} >
									<EllipsisIcon size={16} />
								</button>
								{openMenuId === i && (
									<div ref={(el) => {
										if (el) menuRefs.current[i] = el;
									}}
										className="font-robo-mono text-sm absolute left-full ml-2 top-0 bg-background border border-foreground-muted/30 rounded-sm shadow-lg z-50 min-w-max" >
										<button className="flex gap-1 items-center w-full py-0.5 px-2 text-left border-t border-foreground-muted/20"
											onClick={() => {
												deleteLine(i);
												setOpenMenuId(null);
											}} >
											<TrashIcon size={16} />
											<label>Delete</label>
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div >

	);
}
