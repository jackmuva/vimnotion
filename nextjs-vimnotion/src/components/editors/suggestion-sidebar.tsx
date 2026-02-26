import { Suggestion } from "@/types/primitive-types"

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
			className={`max-w-96 w-fit flex flex-col gap-2 relative h-full bg-secondary-background`}>

		</div>
	);
}
