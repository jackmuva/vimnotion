import { Suggestion } from "@/types/primitive-types"
import { SuggestionDialog } from "./suggestion-dialog";

export const SuggestionSidebar = ({
	paneId,
	suggestions,
	totalLines,
}: {
	paneId: string,
	suggestions: Suggestion[],
	totalLines: number,
}) => {
	return (
		<div id={`suggestion-sidebar-${paneId}`}
			className={`max-w-96 w-fit flex flex-col gap-4 relative h-full bg-secondary-background
			p-2 rounded-sm overflow-y-auto`}>
			{suggestions.map((sugg: Suggestion, i: number) => {
				return <SuggestionDialog key={sugg.id}
					suggestion={sugg} totalLines={totalLines}
					paneId={paneId} index={i} />
			})}
		</div>
	);
}
