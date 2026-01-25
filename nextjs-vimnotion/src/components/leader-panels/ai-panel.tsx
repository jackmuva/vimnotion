import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";
import { PanelType } from "@/types/editor-types";

export const AiPanel = () => {
	const setActivePanel: (panel: PanelType) => void = useEditorStore((state) => state.setActivePanel);
	const closePanel = useEditorStore((state) => state.toggleAiPanel);
	const toggleAsciiModal = useEditorStore((state) => state.toggleAsciiModal);

	useEffect(() => {
		setActivePanel(PanelType.LEADER);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

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
		};
	}, [closePanel, setActivePanel]);

	return (
		<div id={`ai-panel`}
			className='font-robo-mono text-xl z-30 w-full bg-background-muted h-1/4 absolute bottom-0 left-0
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28 content-start gap-4'>
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
			</div>

		</div>
	);

}
