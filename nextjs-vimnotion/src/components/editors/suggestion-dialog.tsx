import { Suggestion } from "@/types/primitive-types";

export const SuggestionDialog = ({
	suggestion,
	totalLines,
}: {
	suggestion: Suggestion,
	totalLines: number,
}) => {
	return (
		<div id={`suggestion-${suggestion.id}`}
			className="flex flex-col gap-1 border-b border-foreground/50 pb-1">
			<div className="flex text-sm font-bold">
				{suggestion.startLine !== suggestion.endLine ? ` Lines: ${suggestion.startLine} - ${suggestion.endLine}` :
					`Line: ${suggestion.startLine}`}
			</div>
			<div className="bg-red-300 p-1 text-sm text-black">
				{suggestion.oldString}
			</div>
			<div className="bg-green-300 p-1 text-sm text-black">
				{suggestion.newString}
			</div>
			<div className="text-sm">
				{suggestion.explanation}
			</div>
			<div className="flex gap-4 w-full justify-center">
				<div className="text-sm">
					<button className="cursor-pointer">
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
