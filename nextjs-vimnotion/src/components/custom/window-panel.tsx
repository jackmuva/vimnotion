import { useEditorStore } from "@/store/editor-store";

export const WindowPanel = ({ closePanel }: { closePanel: () => void }) => {
	const goToNeighbor = useEditorStore((state) => state.goToNeighbor)
	return (
		<div id={`window-panel`}
			className='z-30 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
			<div>
				<button id={`first-leader-option`} className="cursor-pointer">[h]</button>
				&rarr;move left a window
			</div>
			<div>
				<button className="cursor-pointer">[j]</button>
				&rarr;move down a window
			</div>
			<div>
				<button className="cursor-pointer">[k]</button>
				&rarr;move up a window
			</div>
			<div>
				<button className="cursor-pointer">[l]</button>
				&rarr;move right a window
			</div>
			<div>
				<button className="cursor-pointer">[w]</button>
				&rarr;next window
			</div>

		</div>
	);

}
