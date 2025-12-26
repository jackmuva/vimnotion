import { useEditorStore } from "@/store/editor-store";
import { Waypoints } from "lucide-react";

export const LeaderButton = () => {
	const { toggleLeaderPanel } = useEditorStore((state) => state);
	return (
		<div className="absolute z-30 bottom-4 left-4"
			high-data-tooltip="<Space> to open leader panel. <Esc> to close">
			<button className="hover:bg-background-muted/50 p-1 cursor-pointer rounded-sm"
				onClick={() => toggleLeaderPanel()}>
				<Waypoints size={25} />
			</button>
		</div>
	);
};
