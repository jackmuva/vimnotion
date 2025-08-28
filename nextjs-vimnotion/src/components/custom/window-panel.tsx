import { useEditorStore } from "@/store/editor-store";
import { Direction } from "@/types/editor-types";

export const WindowPanel = ({ closePanel }: { closePanel: () => void }) => {
	const goToNeighbor = useEditorStore((state) => state.goToNeighbor);

	const handleNavigation = (direction: Direction) => {
		closePanel();
		goToNeighbor(direction);
	};

	return (
		<div id={`window-panel`}
			className='z-30 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
			<div>
				<button
					id={`first-leader-option`}
					className="cursor-pointer"
					onClick={() => handleNavigation(Direction.WEST)}
				>
					[h]
				</button>
				&rarr;move left a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(Direction.SOUTH)}
				>
					[j]
				</button>
				&rarr;move down a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(Direction.NORTH)}
				>
					[k]
				</button>
				&rarr;move up a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(Direction.EAST)}
				>
					[l]
				</button>
				&rarr;move right a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(Direction.EAST)}
				>
					[w]
				</button>
				&rarr;next window
			</div>

		</div>
	);

}
