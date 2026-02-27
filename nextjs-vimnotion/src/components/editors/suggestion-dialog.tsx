import { useEditorStore } from "@/store/editor-store";
import { Suggestion } from "@/types/primitive-types";
import { useEffect } from "react";

export const SuggestionDialog = ({
	suggestion,
	totalLines,
	paneId,
	index,
}: {
	suggestion: Suggestion,
	totalLines: number,
	paneId: string,
	index: number,
}) => {
	const activeSuggestionIndex = useEditorStore((state) => state.activeSuggestionIndex);
	const setActiveIndex = useEditorStore((state) => state.setActiveSuggestionIndex);
	const activePane = useEditorStore((state) => state.activePane);

	useEffect(() => {
		if (paneId === activePane && activeSuggestionIndex === index) {
			const handleYKey = (event: KeyboardEvent) => {
				if (event.key === 'y') {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleNKey = (event: KeyboardEvent) => {
				if (event.key === 'n') {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleJKey = (event: KeyboardEvent) => {
				if (event.key === 'j') {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			};
			document.addEventListener('keydown', handleYKey);

			const handleKKey = (event: KeyboardEvent) => {
				if (event.key === 'k') {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			};
			document.addEventListener('keydown', handleYKey);

			return () => {
				document.removeEventListener('keydown', handleYKey);
				document.removeEventListener('keydown', handleNKey);
				document.removeEventListener('keydown', handleJKey);
				document.removeEventListener('keydown', handleKKey);
			};
		}
	}, [activeSuggestionIndex, setActiveIndex, paneId, index]);

	return (
		<div id={`suggestion-${suggestion.id}`}
			className={`${(paneId === activePane && activeSuggestionIndex === index) ? "bg-foreground/15" : ""} 
			flex flex-col gap-1 border-b border-foreground/50 pb-1`}>
			<div className="flex text-sm font-bold">
				{suggestion.startLine !== suggestion.endLine ? ` Lines: ${suggestion.startLine} - ${suggestion.endLine}` :
					`Line: ${suggestion.startLine}`}
			</div>
			<div className="text-sm text-black">
				{suggestion.oldString.split('\n').map((line, i) => (
					<div key={i}>
						<span className="bg-red-200/70 px-1 rounded-xs">{line}</span>
					</div>
				))}
			</div>
			<div className="text-sm text-black">
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
