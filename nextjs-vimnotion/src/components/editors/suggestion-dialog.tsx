import { deleteSuggestionById } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
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
	const activeSuggestionIndex = useEditorStore((state) => state.activeSuggestionIndex);
	const setActiveIndex = useEditorStore((state) => state.setActiveSuggestionIndex);
	const activePane = useEditorStore((state) => state.activePane);
	const getPane = useEditorStore((state) => state.getPaneById);
	const setPaneTree = useEditorStore((state) => state.setPaneTree);
	const paneTree = useEditorStore((state) => state.paneTree);

	const incrememntSuggestionIndex = () => {
		console.log("incrementing sugg index");
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
		setPaneTree({
			...paneTree, [paneId]: {
				...paneTree[paneId],
				suggestions: paneTree[paneId].suggestions.filter((_: Suggestion, i: number) => i !== index)
			}
		});
		//TODO: TEST THIS BEHAVIOR
		incrememntSuggestionIndex();
		decrememntSuggestionIndex();
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
		if (paneId === activePane && activeSuggestionIndex === index) {
			// view.dispatch({
			// 	selection: {
			// 		anchor: suggestion.startLine > view.state.doc.length ? view.state.doc.length : suggestion.startLine,
			// 		head: suggestion.startLine > view.state.doc.length ? view.state.doc.length : suggestion.startLine,
			// 	},
			// });
			// view.scrollDOM.scrollTop = suggestion.startLine > view.state.doc.length ? view.state.doc.length : suggestion.startLine;

			const handleYKey = async (event: KeyboardEvent) => {
				if (event.key === 'y') {
					event.preventDefault();
					event.stopImmediatePropagation();
					applySuggestion();
					await deleteSuggestion();
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleNKey = (event: KeyboardEvent) => {
				if (event.key === 'n') {
					event.preventDefault();
					event.stopImmediatePropagation();
					deleteSuggestion();
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

			return () => {
				document.removeEventListener('keydown', handleYKey);
				document.removeEventListener('keydown', handleNKey);
				document.removeEventListener('keydown', handleJKey);
				document.removeEventListener('keydown', handleKKey);
			};
		}
	}, [activeSuggestionIndex, setActiveIndex, paneId, index, paneTree, getPane]);

	return (
		<div id={`suggestion-${suggestion.id}`}
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
					<button className="cursor-pointer" id={`accept-suggestion-${suggestion.id}`}>
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
