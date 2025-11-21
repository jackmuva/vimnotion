import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";
import { Direction, PanelType } from "@/types/editor-types";

export const WindowPanel = () => {
	const activePane: string = useEditorStore((state) => state.activePane);
	const goToNeighbor: (id: string, direction: Direction) => string = useEditorStore((state) => state.goToNeighbor);
	const setActivePanel: (panel: PanelType) => void = useEditorStore((state) => state.setActivePanel);
	const setActivePane: (id: string) => void = useEditorStore((state) => state.updateActivePane);
	const cycleNeighbor: () => string = useEditorStore((state) => state.cycleNeighbor);
	const closePanel = useEditorStore((state) => state.toggleWindowPanel);

	const handleNavigation = (paneId: string) => {
		closePanel();
		setActivePanel(PanelType.MAIN);
		setActivePane(paneId);
	};

	useEffect(() => {
		setActivePanel(PanelType.LEADER);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleHKey = (event: KeyboardEvent) => {
			if (event.key === 'h') {
				event.preventDefault();
				event.stopImmediatePropagation();
				handleNavigation(goToNeighbor(activePane, Direction.WEST));
			}
		};
		document.addEventListener('keydown', handleHKey);

		const handleJKey = (event: KeyboardEvent) => {
			if (event.key === 'j') {
				event.preventDefault();
				event.stopImmediatePropagation();
				handleNavigation(goToNeighbor(activePane, Direction.SOUTH));
			}
		};
		document.addEventListener('keydown', handleJKey);

		const handleKKey = (event: KeyboardEvent) => {
			if (event.key === 'k') {
				event.preventDefault();
				event.stopImmediatePropagation();
				handleNavigation(goToNeighbor(activePane, Direction.NORTH));
			}
		};
		document.addEventListener('keydown', handleKKey);

		const handleLKey = (event: KeyboardEvent) => {
			if (event.key === 'l') {
				event.preventDefault();
				event.stopImmediatePropagation();
				handleNavigation(goToNeighbor(activePane, Direction.EAST));
			}
		};
		document.addEventListener('keydown', handleLKey);

		const handleWKey = (event: KeyboardEvent) => {
			if (event.key === 'w') {
				event.preventDefault();
				event.stopImmediatePropagation();
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
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28 
			content-start gap-4'>
			<div>
				<button
					id={`first-window-option`}
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(activePane, Direction.WEST))}
				>
					[h]
				</button>
				&rarr;move left a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(activePane, Direction.SOUTH))}
				>
					[j]
				</button>
				&rarr;move down a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(activePane, Direction.NORTH))}
				>
					[k]
				</button>
				&rarr;move up a window
			</div>
			<div>
				<button
					className="cursor-pointer"
					onClick={() => handleNavigation(goToNeighbor(activePane, Direction.EAST))}
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
