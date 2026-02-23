import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";
import { EditorType, PanelType, PaneNode } from "@/types/editor-types";

export const AiPanel = () => {
	const setActivePanel: (panel: PanelType) => void = useEditorStore((state) => state.setActivePanel);
	const closePanel = useEditorStore((state) => state.toggleAiPanel);
	const toggleAsciiModal = useEditorStore((state) => state.toggleAsciiModal);
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const activePane: string = useEditorStore((state) => state.activePane);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePane);

	const shiftToAgent = (): void => {
		const paneNode: PaneNode = getPane(activePane);
		const updateNode: PaneNode = {
			[activePane]: {
				...paneNode[activePane],
				editorType: EditorType.AGENT,
			},
		}
		updatePane(updateNode);
	}

	useEffect(() => {
		setActivePanel(PanelType.LEADER);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		// const handleEKey = (event: KeyboardEvent) => {
		// 	if (event.key === 'e') {
		// 		event.preventDefault();
		// 		event.stopImmediatePropagation();
		// 		shiftToAgent();
		// 		closePanel();
		// 	}
		// };
		// document.addEventListener('keydown', handleEKey);

		const handleDKey = (event: KeyboardEvent) => {
			if (event.key === 'd') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleAsciiModal();
				closePanel();
			}
		};
		document.addEventListener('keydown', handleDKey);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleDKey);
			// document.removeEventListener('keydown', handleEKey);
		};
	}, [closePanel, setActivePanel]);

	return (
		<div id={`ai-panel`}
			className='font-robo-mono text-xl z-30 w-full bg-background-muted h-1/4 absolute bottom-0 left-0
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28 content-start gap-4'>
			{/* <div> */}
			{/* 	<button id="first-ai-option" */}
			{/* 		className="cursor-pointer" */}
			{/* 		onClick={() => { */}
			{/* 			closePanel(); */}
			{/* 		}} > */}
			{/* 		<span className="font-bold text-orange-500">[e]</span> */}
			{/* 	</button> */}
			{/* 	ditor agent */}
			{/* </div> */}
			{getPane(activePane)[Object.keys(getPane(activePane))[0]].editorType === EditorType.VIM &&
				<div>
					<button id="first-ai-option"
						className="cursor-pointer"
						onClick={() => {
							toggleAsciiModal();
							closePanel();
						}} >
						<span className="font-bold text-orange-500">[d]</span>
					</button>
					iagram in ascii
				</div>}
		</div>
	);

}
