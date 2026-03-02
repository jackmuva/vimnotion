import { Suggestion } from "@/types/primitive-types"
import { SuggestionDialog } from "./suggestion-dialog";
import { EditorView } from "codemirror";

export const SuggestionSidebar = ({
	paneId,
	suggestions,
	totalLines,
	editorView,
}: {
	paneId: string,
	suggestions: Suggestion[],
	totalLines: number,
	editorView: EditorView,
}) => {
	return (
		<div id={`suggestion-sidebar-${paneId}`}
			className={`max-w-96 w-fit flex flex-col gap-4 relative h-full bg-secondary-background
			p-2 rounded-sm overflow-y-auto`}>
			{suggestions
				.filter((sugg: Suggestion) => !sugg.deleted)
				.map((sugg: Suggestion, i: number) => {
					return <SuggestionDialog key={sugg.id}
						suggestion={sugg} view={editorView}
						paneId={paneId} index={i} />
				})}
		</div>
	);
}
