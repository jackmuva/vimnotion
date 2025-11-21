import { useEditorStore } from "@/store/editor-store";
import { EditorType, PaneNode } from "@/types/editor-types";
import { useEffect } from "react";

export const LeaderPanel = () => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const activePane: string = useEditorStore((state) => state.activePane);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePane);
	const closePanel = useEditorStore((state) => state.toggleLeaderPanel);
	const toggleWindowPanel = useEditorStore((state) => state.toggleWindowPanel);
	const toggleSearchPanel = useEditorStore((state) => state.toggleSearchPanel);
	const setActivePane: (id: string) => void = useEditorStore((state) => state.updateActivePane);
	const cycleNeighbor: () => string = useEditorStore((state) => state.cycleNeighbor);

	const shiftToMarkdown = (): void => {
		const paneNode: PaneNode = getPane(activePane);
		const updateNode: PaneNode = {
			[activePane]: {
				...paneNode[activePane],
				editorType: EditorType.MARKDOWN,
			},
		}
		updatePane(updateNode);
		setActivePane(cycleNeighbor())
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleWKey = (event: KeyboardEvent) => {
			if (event.key === 'w') {
				toggleWindowPanel();
				closePanel();
			}
		};
		document.addEventListener('keydown', handleWKey);

		const handleMKey = (event: KeyboardEvent) => {
			if (event.key === 'm') {
				event.preventDefault();
				event.stopImmediatePropagation();
				shiftToMarkdown();
				closePanel();
			}
		};
		document.addEventListener('keydown', handleMKey);

		const handleSKey = (event: KeyboardEvent) => {
			if (event.key === 's') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSearchPanel();
				closePanel();
			}
		};
		document.addEventListener('keydown', handleSKey);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleWKey);
			document.removeEventListener('keydown', handleMKey);
			document.removeEventListener('keydown', handleSKey);
		};
	}, [closePanel, toggleWindowPanel]);

	return (
		<div id={`leader-panel`}
			className='z-20 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28 
			content-start gap-4'>
			<div>
				<button id={`first-leader-option`}
					className="cursor-pointer"
					onClick={() => {
						shiftToMarkdown();
						closePanel();
					}}>
					[m]
				</button>arkdown
			</div>
			<div>
				<button className="cursor-pointer"
					onClick={() => {
						toggleWindowPanel();
						closePanel();
					}}>
					[w]
				</button>indow
			</div>
			<div>
				<button className="cursor-pointer"
					onClick={() => {
						toggleSearchPanel();
						closePanel();
					}}>
					[s]
				</button>earch
			</div>

		</div>
	);

}
