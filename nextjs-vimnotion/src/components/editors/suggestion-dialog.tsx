import { deleteSuggestionById } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
import { PanelType, PaneNode } from "@/types/editor-types";
import { Suggestion } from "@/types/primitive-types";
import { EditorView } from "codemirror";
import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react"
import { htmlToMarkdown, markdownToHtml } from "@/lib/utils";

export const SuggestionDialog = ({
	suggestion,
	paneId,
	index,
	refocus,
	view,
	editor,
}: {
	suggestion: Suggestion,
	paneId: string,
	index: number,
	refocus: () => void,
	view?: EditorView,
	editor?: Editor,
}) => {
	const activePane = useEditorStore((state) => state.activePane);
	const getPane = useEditorStore((state) => state.getPaneById);
	const updatePane = useEditorStore((state) => state.updatePane);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const activePanel = useEditorStore((state) => state.activePanel);
	const activeIndex = useEditorStore((state) => state.paneTree[paneId].suggestionState.activeSuggestionIndex);
	const [applying, setApplying] = useState<boolean>(false);

	const incrememntSuggestionIndex = () => {
		let curIndex = getPane(paneId)[paneId].suggestionState.activeSuggestionIndex + 1;
		if (curIndex < getPane(paneId)[paneId].suggestionState.suggestions.length) {
			updatePane({
				[paneId]: {
					...getPane(paneId)[paneId],
					suggestionState: {
						...getPane(paneId)[paneId].suggestionState,
						activeSuggestionIndex: curIndex,
					}
				}
			});
		}
	}

	const decrememntSuggestionIndex = () => {
		let curIndex = getPane(paneId)[paneId].suggestionState.activeSuggestionIndex - 1;
		if (curIndex >= 0) {
			updatePane({
				[paneId]: {
					...getPane(paneId)[paneId],
					suggestionState: {
						...getPane(paneId)[paneId].suggestionState,
						activeSuggestionIndex: curIndex,
					}
				}
			});
		}
	}

	const deleteSuggestion = async () => {
		await deleteSuggestionById(suggestion.id);
		const curPane: PaneNode = getPane(paneId);
		updatePane({
			[paneId]: {
				...curPane[paneId],
				suggestionState: {
					...curPane[paneId].suggestionState,
					suggestions: curPane[paneId].suggestionState.suggestions.filter((_: Suggestion, i: number) => i !== index),
					activeSuggestionIndex: curPane[paneId].suggestionState.activeSuggestionIndex >= curPane[paneId].suggestionState.suggestions.filter((_: Suggestion, i: number) => i !== index).length ?
						curPane[paneId].suggestionState.suggestions.filter((_: Suggestion, i: number) => i !== index).length - 1 :
						curPane[paneId].suggestionState.activeSuggestionIndex
				}
			}
		});
	}

	const findClosestIndex = (matchString: string, line: number, content: string): number | null => {
		const matchIndexes: number[] = [];
		let curStart: number = 0;
		while (content.slice(curStart).indexOf(matchString) !== -1) {
			matchIndexes.push(content.slice(curStart).indexOf(matchString) + curStart);
			curStart += content.slice(curStart).indexOf(matchString) + 1;
		}

		const lineIndex: number = content.split("\n").slice(0, line).join("\n").length;

		let closestIndex: number | null = null;
		let closestDist: number | null = null;
		for (const matchIndex of matchIndexes) {
			const dist = Math.abs(lineIndex - matchIndex);
			if (closestDist === null) {
				closestDist = dist;
				closestIndex = matchIndex;
			} else if (dist < closestDist) {
				closestDist = dist;
				closestIndex = matchIndex;
			}
		}
		return closestIndex;
	}

	const applySuggestion = async () => {
		if (view) {
			const content: string = view.state.doc.toString();
			const closestIndex: number | null = findClosestIndex(suggestion.oldString, suggestion.startLine, content);

			const prefix: string = content.slice(0, closestIndex!);
			const suffix: string = content.slice(closestIndex! + suggestion.oldString.length);
			const toChange = suggestion.newString;

			const lineNumber = Math.min(suggestion.startLine, view.state.doc.lines);
			const line = view.state.doc.line(lineNumber);

			view.dispatch({
				changes: {
					from: 0,
					to: content.length,
					insert: prefix + toChange + suffix,
				},
				selection: { anchor: line.from, head: line.from },
				scrollIntoView: true,
			});
			view.scrollDOM.scrollTop = line.from;
		} else if (editor) {
			const content: string = await htmlToMarkdown(editor.getHTML());
			const closestIndex: number | null = findClosestIndex(suggestion.oldString, suggestion.startLine, content);
			if (!closestIndex) return;

			const prefix: string = content.slice(0, closestIndex);
			const suffix: string = content.slice(closestIndex! + suggestion.oldString.length);
			const toChange = suggestion.newString;
			const numOcc: number = prefix.split(suggestion.oldString).length - 1;

			const toChangeHtml = await markdownToHtml(suggestion.oldString);
			const toChangePlainText = toChangeHtml.replace(/<[^>]*>/g, '').trim();

			let selectionPos = 1;
			let occurrenceCount = 0;
			if (toChangePlainText) {
				editor.state.doc.descendants((node, nodePos) => {
					if (node.isText) {
						const nodeText = node.text || '';
						let searchStart = 0;
						let indexInNode: number;
						while ((indexInNode = nodeText.indexOf(toChangePlainText, searchStart)) !== -1) {
							if (occurrenceCount === numOcc) {
								selectionPos = nodePos + indexInNode;
								return false;
							}
							occurrenceCount++;
							searchStart = indexInNode + 1;
						}
					}
					selectionPos = prefix.length;
					return true;
				});
			}

			editor.chain()
				.setContent(await markdownToHtml(prefix + toChange + suffix))
				.setTextSelection(selectionPos)
				.scrollIntoView()
				.run();
		}
	}

	useEffect(() => {
		if (paneId === activePane && getPane(paneId)[paneId].suggestionState.activeSuggestionIndex === index &&
			activePanel === PanelType.MAIN && getPane(paneId)[paneId].suggestionState.suggestionActive) {
			if (view) {
				const matchLine: number = view.state.doc.toString().slice(0, findClosestIndex(suggestion.oldString, suggestion.startLine, view.state.doc.toString())!).split("\n").length;
				const lineNumber = Math.min(matchLine, view.state.doc.lines);
				const line = view.state.doc.line(lineNumber);
				view.dispatch({
					selection: { anchor: line.from, head: line.from },
					scrollIntoView: true,
				});
				view.scrollDOM.scrollTop = line.from;
			} else if (editor) {
				(async () => {
					const content: string = await htmlToMarkdown(editor.getHTML());
					const closestIndex: number | null = findClosestIndex(suggestion.oldString, suggestion.startLine, content);

					const prefix: string = content.slice(0, closestIndex ?? 0);
					const toChangeHtml: string = await markdownToHtml(suggestion.oldString);
					const toChangePlainText = toChangeHtml.replace(/<[^>]*>/g, '').trim();
					const numOcc: number = prefix.split(toChangePlainText).length - 1;

					let selectionPos = 1;
					let occurrenceCount = 0;
					let found = false;
					if (toChangePlainText) {
						editor.state.doc.descendants((node, nodePos) => {
							if (node.isText) {
								const nodeText = node.text || '';
								let searchStart = 0;
								const indexInNode = nodeText.indexOf(toChangePlainText, searchStart)
								while (indexInNode !== -1) {
									if (occurrenceCount === numOcc) {
										found = true;
										selectionPos = nodePos + indexInNode;
										return false;
									}
									occurrenceCount++;
									searchStart = indexInNode + 1;
								}
							}
							return true;
						});
					}
					if (!found) selectionPos = content.split("\n").filter((_: string, i: number) => i <= suggestion.endLine).join("\n").length;

					editor.chain()
						.setTextSelection(selectionPos)
						.focus()
						.scrollIntoView()
						.blur()
						.run();
				})();
			}

			const handleYKey = async (event: KeyboardEvent) => {
				if (event.key === 'y') {
					event.preventDefault();
					event.stopImmediatePropagation();
					setApplying(true);
					applySuggestion();
					setTimeout(async () => {
						await deleteSuggestion();
						setApplying(false);
					}, 3000);
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleNKey = async (event: KeyboardEvent) => {
				if (event.key === 'n') {
					event.preventDefault();
					event.stopImmediatePropagation();
					await deleteSuggestion();
				}
			};
			document.addEventListener('keydown', handleNKey);

			const handleJKey = (event: KeyboardEvent) => {
				if (event.key === 'j') {
					event.preventDefault();
					event.stopImmediatePropagation();
					incrememntSuggestionIndex();
				}
			};
			document.addEventListener('keydown', handleJKey);

			const handleKKey = (event: KeyboardEvent) => {
				if (event.key === 'k') {
					event.preventDefault();
					event.stopImmediatePropagation();
					decrememntSuggestionIndex();
				}
			};
			document.addEventListener('keydown', handleKKey);

			const handleSpaceKey = (event: KeyboardEvent) => {
				if (event.key === ' ') {
					event.preventDefault();
					event.stopImmediatePropagation();
					toggleLeaderPanel();
				}
			};
			document.addEventListener('keydown', handleSpaceKey);


			return () => {
				document.removeEventListener('keydown', handleYKey);
				document.removeEventListener('keydown', handleNKey);
				document.removeEventListener('keydown', handleJKey);
				document.removeEventListener('keydown', handleKKey);
				document.removeEventListener('keydown', handleSpaceKey);
			};
		}
	}, [activeIndex, updatePane, paneId, index, activePane, view, editor,
		getPane, toggleLeaderPanel, activePanel, suggestion,
		getPane(paneId)[paneId].suggestionState.activeSuggestionIndex, getPane(paneId)[paneId].suggestionState.suggestionActive]);

	return (
		<div id={`suggestion--${paneId}-${suggestion.id}`}
			className={`${(paneId === activePane && getPane(paneId)[paneId].suggestionState.activeSuggestionIndex === index
				&& getPane(paneId)[paneId].suggestionState.suggestionActive) ?
				"bg-radial-[at_-20%_50%] from-background to-foreground/15 to-100%" : ""} 
			p-2 flex flex-col gap-1 border-b border-foreground/50 pb-2 font-ibm-mono`}
			onClick={() => refocus()}>
			<div className="text-sm text-black flex flex-col">
				{suggestion.oldString.split('\n').map((line, i) => (
					<div key={i}>
						<span className="bg-red-200/70 px-1 rounded-xs">{line}</span>
					</div>
				))}
			</div>
			<div className="text-sm text-black flex flex-col">
				{suggestion.newString.split('\n').map((line, i) => (
					<div key={i}>
						<span className="bg-green-200/70 px-1 rounded-xs">{line}</span>
					</div>
				))}
			</div>
			<div className="text-sm">
				{suggestion.explanation}
			</div>
			<div className="flex gap-4 w-full justify-center">
				{!applying &&
					<>
						<div className="text-sm">
							<button className="cursor-pointer" id={`accept-suggestion-${paneId}-${suggestion.id}`}
								onClick={() => {
									setApplying(true);
									applySuggestion();
									setTimeout(async () => {
										await deleteSuggestion();
										setApplying(false);
									}, 3000);
								}}>
								<span className="font-bold text-orange-500">[y]</span>
							</button>es, accept
						</div>
						<div className="text-sm">
							<button className="cursor-pointer">
								<span className="font-bold text-orange-500"
									onClick={async () => {
										await deleteSuggestion();
									}}>[n]</span>
							</button>o, decline
						</div>
					</>
				}
				{applying &&
					<div className="text-sm font-bold text-orange-500">
						change applied
					</div>
				}
			</div>
		</div>
	);
}
