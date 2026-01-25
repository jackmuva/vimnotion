import { useEditorStore } from "@/store/editor-store";
import { ChangeEvent, useEffect, useState } from "react";

export const AgentEditor = ({
	paneId
}: {
	paneId: string
}) => {
	const [input, setInput] = useState<string>("");
	const [mode, setMode] = useState<"INPUT" | "LOADING">("INPUT");
	const activeId: string = useEditorStore((state) => state.activePane);

	useEffect(() => {
		if (activeId === paneId) {
			const textInput = window.document.getElementById("agent-input");
			textInput?.focus();

		}
	}, [activeId])


	return (

		<div className='relative h-full w-full rounded-sm z-20 bg-background 
			flex flex-col items-center space-y-2 p-2
			justify-center font-robo-mono '>
			<div className="flex flex-col items-center justify-center max-w-[900px] w-full gap-8">
				<div className="text-5xl font-bold dark:text-indigo-400 text-indigo-600">
					VN Editor
				</div>
				<textarea className="w-full outline outline-offset-2 outline-foreground-muted/50 
					bg-foreground-muted/10 px-1 py-0.5"
					id="agent-input"
					value={input}
					disabled={mode !== "INPUT"}
					placeholder="Describe what type of ASCII art or diagram you'd like"
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
						setInput(e.target.value)
					}} />
			</div>

		</div>
	);
}
