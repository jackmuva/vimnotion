import { Suggestion } from "@/types/primitive-types"
import { SuggestionDialog } from "./suggestion-dialog";
import { EditorView } from "codemirror";
import { Editor } from "@tiptap/react"

export const SuggestionSidebar = ({
	paneId,
	suggestions,
	view,
	editor,
	refocus,
}: {
	paneId: string,
	suggestions: Suggestion[],
	refocus: (index: number) => void,
	view?: EditorView,
	editor?: Editor,
}) => {
	return (
		<div id={`suggestion-sidebar-${paneId}`}
			className={`max-w-[500px] w-fit flex flex-col gap-4 relative h-full bg-radial-[at_0%_50%] from-background to-secondary-background to-100%
			p-2 rounded-sm overflow-y-auto`}>
			{suggestions
				.sort((a: Suggestion, b: Suggestion) => a.startLine - b.startLine)
				.map((sugg: Suggestion, i: number) => {
					return <SuggestionDialog key={sugg.id}
						suggestion={sugg} view={view} editor={editor}
						paneId={paneId} index={i}
						refocus={() => refocus(i)} />
				})}
		</div>
	);
}
