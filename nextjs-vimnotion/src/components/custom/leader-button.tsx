import { useEditorStore } from "@/store/editor-store";
import { Waypoints } from "lucide-react";

export const LeaderButton = () => {
	const { toggleLeaderPanel } = useEditorStore((state) => state);
	return (
		<div className="absolute z-30 bottom-4 left-4">
			<button className="hover:bg-background-muted/50 p-1 cursor-pointer rounded-sm"
				onClick={() => toggleLeaderPanel()}>
				<Waypoints size={25} />
			</button>
		</div>
	);
};
