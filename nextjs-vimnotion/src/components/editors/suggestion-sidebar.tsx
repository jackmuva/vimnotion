import { Suggestion } from "@/types/primitive-types"
import { SuggestionDialog } from "./suggestion-dialog";
import { EditorView } from "codemirror";

export const SuggestionSidebar = ({
	paneId,
	suggestions,
	editorView,
}: {
	paneId: string,
	suggestions: Suggestion[],
	editorView: EditorView,
}) => {
	return (
		<div id={`suggestion-sidebar-${paneId}`}
			className={`max-w-1/2 w-fit flex flex-col gap-4 relative h-full bg-secondary-background
			p-2 rounded-sm overflow-y-auto`}>
			{suggestions
				.sort((a: Suggestion, b: Suggestion) => a.startLine - b.startLine)
				.map((sugg: Suggestion, i: number) => {
					return <SuggestionDialog key={sugg.id}
						suggestion={sugg} view={editorView}
						paneId={paneId} index={i} />
				})}
		</div>
	);
}
