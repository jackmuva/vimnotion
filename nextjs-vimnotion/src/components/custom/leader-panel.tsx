import { useEditorStore } from "@/store/editor-store";
import { EditorType, PaneNode } from "@/types/editor-types";
import { useEffect } from "react";

export const LeaderPanel = () => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const activePane: string = useEditorStore((state) => state.activePane);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePaneById);
	const closePanel = useEditorStore((state) => state.toggleLeaderPanel);
	const toggleWindowPanel = useEditorStore((state) => state.toggleWindowPanel);

	const shiftToMarkdown = (): void => {
		const paneNode: PaneNode = getPane(activePane);
		const updateNode: PaneNode = {
			[activePane]: {
				...paneNode[activePane],
				editorType: EditorType.MARKDOWN,
			},
		}
		updatePane(updateNode);
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
				shiftToMarkdown();
				closePanel();
			}
		};
		document.addEventListener('keydown', handleMKey);


		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleWKey);
			document.removeEventListener('keydown', handleMKey);
		};
	}, [closePanel, toggleWindowPanel]);

	return (
		<div id={`leader-panel`}
			className='z-20 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
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
		</div>
	);

}
