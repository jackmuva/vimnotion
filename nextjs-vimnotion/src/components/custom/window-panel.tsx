import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";
import { Direction } from "@/types/editor-types";

export const WindowPanel = ({ closePanel }: { closePanel: () => void }) => {
	const goToNeighbor = useEditorStore((state) => state.goToNeighbor);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);
	const setActivePane = useEditorStore((state) => state.updateActivePane);
	const cycleNeighbor = useEditorStore((state) => state.cycleNeighbor);

	const handleNavigation = (paneId: string) => {
		closePanel();
		setActivePanel(null);
		setActivePane(paneId);
	};

	useEffect(() => {
		setActivePanel("window-panel");
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleHKey = (event: KeyboardEvent) => {
			if (event.key === 'h') {
				handleNavigation(goToNeighbor(Direction.WEST));
			}
		};
		document.addEventListener('keydown', handleHKey);

		const handleJKey = (event: KeyboardEvent) => {
			if (event.key === 'j') {
				handleNavigation(goToNeighbor(Direction.SOUTH));
			}
		};
		document.addEventListener('keydown', handleJKey);

		const handleKKey = (event: KeyboardEvent) => {
			if (event.key === 'k') {
				handleNavigation(goToNeighbor(Direction.NORTH));
			}
		};
		document.addEventListener('keydown', handleKKey);

		const handleLKey = (event: KeyboardEvent) => {
			if (event.key === 'l') {
				handleNavigation(goToNeighbor(Direction.EAST));
			}
		};
		document.addEventListener('keydown', handleLKey);

		const handleWKey = (event: KeyboardEvent) => {
			if (event.key === 'w') {
				handleNavigation(cycleNeighbor());
			}
		};
		document.addEventListener('keydown', handleWKey);


		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleHKey);
			document.removeEventListener('keydown', handleJKey);
			document.removeEventListener('keydown', handleKKey);
			document.removeEventListener('keydown', handleLKey);
			document.removeEventListener('keydown', handleWKey);
		};
	}, [closePanel, cycleNeighbor, goToNeighbor, setActivePanel]);

	return (
		<div id={`window-panel`}
			className='z-30 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
			<div>
				<button
					id={`first-window-option`}
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(Direction.WEST))}
				>
					[h]
				</button>
				&rarr;move left a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(Direction.SOUTH))}
				>
					[j]
				</button>
				&rarr;move down a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(Direction.NORTH))}
				>
					[k]
				</button>
				&rarr;move up a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(Direction.EAST))}
				>
					[l]
				</button>
				&rarr;move right a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(cycleNeighbor())}
				>
					[w]
				</button>
				&rarr;next window
			</div>

		</div>
	);

}
