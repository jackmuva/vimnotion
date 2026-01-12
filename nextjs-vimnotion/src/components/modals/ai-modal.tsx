import { useEditorStore } from "@/store/editor-store";
import { PanelType } from "@/types/editor-types";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";

export const AiModal = () => {
	const [input, setInput] = useState<string>("");
	const { toggleAiModal, setActivePanel } = useEditorStore((state) => state);
	useEffect(() => {
		setActivePanel(PanelType.MODAL);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleAiModal();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		const handleCrKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				event.preventDefault();
				event.stopImmediatePropagation();
				console.log("submitting");
			}
		};
		document.addEventListener('keydown', handleCrKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleCrKeyDown);
		}
	}, []);

	return (
		<div className="font-robo-mono text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 h-[600px] max-h-11/12 max-w-11/12 w-[900px] 
			flex flex-col items-center bg-background">
			<div className="h-full w-full flex flex-col justify-between">
				<div className={`w-full h-full outline-offset-2 outline outline-foreground-muted/50 
					p-3 mb-4`}>

				</div>
				<div className="w-full bg-background">
					<form>
						<input type="text" className="w-full outline outline-offset-2 outline-foreground-muted/50 
					bg-foreground-muted/10 px-1 py-0.5"
							id="ai-modal-input"
							value={input}
							placeholder="Describe what type of ASCII art or diagram you'd like"
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								setInput(e.target.value)
							}} />
					</form>
				</div>
			</div>
		</div >
	);
}
