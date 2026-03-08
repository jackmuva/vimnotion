import { deleteSuggestionById } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
import { PanelType, PaneNode } from "@/types/editor-types";
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
	//TODO: Refactor the activeSuggestionIndex to be a part of the pane state
	const activeSuggestionIndex = useEditorStore((state) => state.activeSuggestionIndex);
	const setActiveIndex = useEditorStore((state) => state.setActiveSuggestionIndex);
	const activePane = useEditorStore((state) => state.activePane);
	const getPane = useEditorStore((state) => state.getPaneById);
	const getPaneById = useEditorStore((state) => state.getPaneById);
	const updatePane = useEditorStore((state) => state.updatePane);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const activePanel = useEditorStore((state) => state.activePanel);

	const incrememntSuggestionIndex = () => {
		let curIndex = activeSuggestionIndex + 1;
		if (curIndex < getPane(activePane)[activePane].suggestions.length) {
			setActiveIndex(curIndex);
		}
	}

	const decrememntSuggestionIndex = () => {
		let curIndex = activeSuggestionIndex - 1;
		if (curIndex >= 0) {
			setActiveIndex(curIndex);
		}
	}

	const deleteSuggestion = async () => {
		await deleteSuggestionById(suggestion.id);
		const curPane: PaneNode = getPaneById(paneId);
		updatePane({
			[paneId]: {
				...curPane[paneId],
				suggestions: curPane[paneId].suggestions.filter((_: Suggestion, i: number) => i !== index)
			}
		});
	}

	const applySuggestion = () => {
		const content: string = view.state.doc.toString();

		const prefix: string[] = content.split("\n").slice(0, suggestion.startLine);
		const suffix: string[] = content.split("\n").slice(suggestion.endLine + 1);
		let toChange: string = content.split("\n").slice(suggestion.startLine, suggestion.endLine + 1).join("\n");
		toChange = toChange.replace(suggestion.oldString, suggestion.newString);

		view.dispatch({
			changes: {
				from: 0,
				to: content.length,
				insert: prefix.join("\n") + "\n" + toChange + "\n" + suffix.join("\n"),
			}
		});
	}

	useEffect(() => {
		if (paneId === activePane && activeSuggestionIndex === index && activePanel === PanelType.SUGGESTION) {
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
	}, [activeSuggestionIndex, setActiveIndex, paneId, index, getPaneById,
		updatePane, getPane, toggleLeaderPanel, activePanel]);

	return (
		<div id={`suggestion--${paneId}-${suggestion.id}`}
			className={`${(paneId === activePane && activeSuggestionIndex === index && getPane(paneId)[paneId].suggestionActive) ?
				"bg-foreground/15" : ""} 
			flex flex-col gap-1 border-b border-foreground/50 pb-2 font-ibm-mono`}>
			<div className="flex text-sm font-bold">
				{suggestion.startLine !== suggestion.endLine ? ` Lines: ${suggestion.startLine} - ${suggestion.endLine}` :
					`Line: ${suggestion.startLine}`}
			</div>
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
