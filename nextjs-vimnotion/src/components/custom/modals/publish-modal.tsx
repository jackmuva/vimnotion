import { useEditorStore } from "@/store/editor-store";
import { PaneNode } from "@/types/editor-types";

export const PublishModal = () => {
	const { activePane, getPaneById } = useEditorStore((state) => state);
	const activeTree: PaneNode = getPaneById(activePane);
	console.log("active: ", activeTree);

	return (
		<div className="font-pixel text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 bg-background h-48 max-w-11/12 w-[700px] p-4 
			flex flex-col justify-between outline  outline-offset-2 
			outline-foreground-muted/50">
			<div className="h-full w-full flex flex-col justify-between">

			</div>
			<div className="w-full flex gap-8 justify-center text-2xl">
				<div>
					<button
						id="image-confirmation-option"
						className="cursor-pointer"
						onClick={() => {

						}}>
						<span className="font-bold text-orange-500">[y]</span>
					</button>es, publish!
				</div>
				<div>
					<button
						className="cursor-pointer"
						onClick={() => {

						}}>
						<span className="font-bold text-orange-500">[n]</span>
					</button>o, cancel
				</div>

			</div>
		</div>
	);
}
