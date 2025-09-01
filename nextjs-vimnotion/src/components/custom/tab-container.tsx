import { useEditorStore } from "@/store/editor-store";
import { EditorContainer } from "./editor-container";
import { useEffect, useState } from "react";

export const TabContainer = ({
	toggleSidebar,
	toggleLeaderPanel
}: {
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void
}) => {
	const tabs = useEditorStore(state => state.tabArray);
	const activeTab = useEditorStore(state => state.activeTab);
	const initTabMap = useEditorStore(state => state.initTabMap);
	const tabMap = useEditorStore(state => state.tabMap);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (tabs && tabs.length === 0) {
			initTabMap();
		}
	}, [tabs]);

	console.log("tabs: ", tabs);
	console.log(tabMap);

	if (!isClient || !tabs || tabs.length === 0) {
		return <div className="h-full w-full text-center">Loading...</div>;
	}
	return (
		<>
			<EditorContainer rootId={tabMap[activeTab].root}
				toggleLeaderPanel={toggleLeaderPanel}
				toggleSidebar={toggleSidebar} />
		</>
	);
}
