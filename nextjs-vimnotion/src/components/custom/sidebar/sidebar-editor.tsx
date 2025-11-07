import { EditorView, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
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
import { DirectoryTree, SidebarData } from "@/types/sidebar-types";
import { useEditorStore } from "@/store/editor-store";
import { 
	parseBufferToEntries, 
	parseTreeToEntries, 
	detectOperations,
	formatOperationsForDisplay,
	applyOperationsToTree
} from "@/utils/sidebar-operations";


export const SidebarEditor = ({
	data,
}: {
	data: SidebarData,
}) => {
	const [vimEditor, setVimEditor] = useState<EditorView | null>(null);
	const themeRef = useRef(new Compartment());
	const theme = themeRef.current;
	const [isClient, setIsClient] = useState(false);
	const lastContentRef = useRef<string>("");
	const directory: DirectoryTree = JSON.parse(data.Data!);
	const { 
		location, 
		setOilLine,
		originalSidebarBuffer,
		currentSidebarBuffer,
		setOriginalSidebarBuffer,
		setCurrentSidebarBuffer,
		setPendingOperations,
		setShowOperationConfirmation,
		showOperationConfirmation,
		pendingOperations,
		clearSidebarOperations,
	} = useEditorStore((state) => state);

	const getSidebarBuffer = (locArr: Array<string>, dir: DirectoryTree) => {
		let curDir: DirectoryTree = dir;
		for (const loc of locArr) {
			if (loc && curDir[loc + "/"].children !== undefined) {
				curDir = curDir[loc + "/"].children;
			}
		}
		return Object.keys(curDir).join("\n");
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

		// Track current buffer content for change detection
		const currentContent = v.state.doc.toString();
		setCurrentSidebarBuffer(currentContent);
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
	}, [vimEditor, theme]);

	useEffect(() => {
		if (!isClient || vimEditor === null) {
			return;
		}

		const newContent = getSidebarBuffer(location.split("/"), directory);
		if (newContent !== lastContentRef.current) {
			lastContentRef.current = newContent;
			// Store the original buffer state when location changes
			setOriginalSidebarBuffer(newContent);
			setCurrentSidebarBuffer(newContent);
			clearSidebarOperations();
			vimEditor.dispatch({
				changes: {
					from: 0,
					to: vimEditor.state.doc.length,
					insert: newContent
				}
			});
		}
	}, [directory, location, isClient, vimEditor, setOriginalSidebarBuffer, setCurrentSidebarBuffer, clearSidebarOperations]);

	/**
	 * Handle save operation (Ctrl+S in Vim or custom keybinding)
	 * Detects changes and shows confirmation
	 */
	const handleSidebarSave = () => {
		if (!vimEditor) return;

		const originalEntries = parseBufferToEntries(originalSidebarBuffer);
		const currentEntries = parseBufferToEntries(currentSidebarBuffer);

		// Check if there are any changes
		if (JSON.stringify(originalEntries) === JSON.stringify(currentEntries)) {
			console.log("No changes detected");
			return;
		}

		// Detect operations
		const summary = detectOperations(originalEntries, currentEntries);
		setPendingOperations(summary.operations);

		// Show confirmation dialog
		setShowOperationConfirmation(true);
	};

	/**
	 * Confirm and apply pending operations
	 */
	const confirmOperations = () => {
		if (pendingOperations.length === 0) {
			setShowOperationConfirmation(false);
			return;
		}

		// Apply operations to the directory tree
		const updatedTree = applyOperationsToTree(directory, pendingOperations);
		
		// TODO: Send updated tree to backend via API
		console.log("Applying operations:", pendingOperations);
		console.log("Updated tree:", updatedTree);

		// Clear operations and close confirmation
		setShowOperationConfirmation(false);
		clearSidebarOperations();
	};

	/**
	 * Discard pending operations
	 */
	const discardOperations = () => {
		// Reset current buffer to original state
		if (vimEditor) {
			vimEditor.dispatch({
				changes: {
					from: 0,
					to: vimEditor.state.doc.length,
					insert: originalSidebarBuffer
				}
			});
		}
		setShowOperationConfirmation(false);
		clearSidebarOperations();
	};

	useEffect(() => {
		if (!isClient || vimEditor !== null) {
			return;
		}

		const editorElement = document.querySelector(`#sidebar-editor`);
		if (!editorElement) {
			return;
		}

		const sidebarVimCustomizations = keymap.of([
			{
				key: "Ctrl-s",
				run: (target) => {
					handleSidebarSave();
					return true;
				},
				preventDefault: true,
			},
		]);

		const view = new EditorView({
			doc: getSidebarBuffer(location.split("/"), directory),
			extensions: [
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
				sidebarVimCustomizations,
				new Compartment().of(customTheme),
				theme.of(lightTheme),
				cursorChangeListener,
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

			{/* Confirmation Dialog for Pending Operations */}
			{showOperationConfirmation && pendingOperations.length > 0 && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-sm'>
					<div className='bg-secondary-background border border-border rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto shadow-lg'>
						<h2 className='text-lg font-bold mb-4'>Confirm Sidebar Operations</h2>

						<div className='bg-primary-background p-4 rounded mb-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto'>
							{formatOperationsForDisplay(pendingOperations)}
						</div>

						<div className='flex gap-4'>
							<button
								onClick={confirmOperations}
								className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition'
							>
								Confirm (Ctrl+Y)
							</button>
							<button
								onClick={discardOperations}
								className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition'
							>
								Discard (Ctrl+N)
							</button>
						</div>
					</div>
				</div>
			)}
		</div>

	);
}
