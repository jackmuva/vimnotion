import { deleteSuggestionById } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
import { PaneNode } from "@/types/editor-types";
import { Suggestion } from "@/types/primitive-types";
import { EditorView } from "codemirror";
import { useEffect } from "react";

export const SuggestionDialog = ({
	suggestion,
	paneId,
	index,
	view,
}: {
	suggestion: Suggestion,
	paneId: string,
	index: number,
	view: EditorView,
}) => {
	const activePane = useEditorStore((state) => state.activePane);
	const getPane = useEditorStore((state) => state.getPaneById);
	const updatePane = useEditorStore((state) => state.updatePane);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const activePanel = useEditorStore((state) => state.activePanel);

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

	const applySuggestion = () => {
		const content: string = view.state.doc.toString();

		const prefix: string[] = content.split("\n").slice(0, suggestion.startLine - 1);
		const suffix: string[] = content.split("\n").slice(suggestion.endLine);
		let toChange: string = content.split("\n").slice(suggestion.startLine - 1, suggestion.endLine).join("\n");
		toChange = toChange.replace(suggestion.oldString, suggestion.newString);

		view.dispatch({
			changes: {
				from: 0,
				to: content.length,
				insert: prefix.join("\n") + (prefix.length > 0 ? "\n" : "") + toChange + (suffix.length > 0 ? "\n" : "") + suffix.join("\n"),
			}
		});
	}

	useEffect(() => {
		if (paneId === activePane && getPane(paneId)[paneId].suggestionState.activeSuggestionIndex === index) {
			const lineNumber = Math.min(suggestion.startLine, view.state.doc.lines);
			const line = view.state.doc.line(lineNumber);
			view.dispatch({
				selection: { anchor: line.from, head: line.from },
				scrollIntoView: true,
			});
			view.scrollDOM.scrollTop = line.from;

			const handleYKey = async (event: KeyboardEvent) => {
				if (event.key === 'y') {
					event.preventDefault();
					event.stopImmediatePropagation();
					applySuggestion();
					await deleteSuggestion();
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleNKey = async (event: KeyboardEvent) => {
				if (event.key === 'n') {
					event.preventDefault();
					event.stopImmediatePropagation();
					await deleteSuggestion();
					incrememntSuggestionIndex();
					decrememntSuggestionIndex();
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
	}, [getPane(paneId)[paneId].suggestionState.activeSuggestionIndex, updatePane, paneId, index,
		updatePane, getPane, toggleLeaderPanel, activePanel]);

	return (
		<div id={`suggestion--${paneId}-${suggestion.id}`}
			className={`${(paneId === activePane && getPane(paneId)[paneId].suggestionState.activeSuggestionIndex === index
				&& getPane(paneId)[paneId].suggestionState.suggestionActive) ?
				"bg-foreground/15" : ""} 
			flex flex-col gap-1 border-b border-foreground/50 pb-2 font-ibm-mono`}>
			<div className="flex text-sm font-bold">
				{suggestion.startLine !== suggestion.endLine ? ` Lines: ${suggestion.startLine} - ${suggestion.endLine}` :
					`Line: ${suggestion.startLine}`}
			</div>
			<div className="text-sm text-black flex flex-col">
				{suggestion.oldString.split('\n').map((line, i) => (
					<div key={i}>
						<span className="bg-red-200/70 px-1 rounded-xs">{`[${suggestion.startLine + i}]`} {line}</span>
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
				<div className="text-sm">
					<button className="cursor-pointer" id={`accept-suggestion-${paneId}-${suggestion.id}`}>
						<span className="font-bold text-orange-500">[y]</span>
					</button>es, accept
				</div>
				<div className="text-sm">
					<button className="cursor-pointer">
						<span className="font-bold text-orange-500">[n]</span>
					</button>o, decline
				</div>

			</div>
		</div>
	);
}
