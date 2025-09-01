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

	if (!isClient || !tabs || tabs.length === 0) {
		return <div className="h-full w-full text-center">Loading...</div>;
	}
	return (
		<div className="h-full w-full flex flex-col space-y-0">
			{tabs.length > 1 &&
				<div className="flex space-x-4">
					{tabs.map((tab, i) => {
						return (
							<div key={tab} className={` ${tab === activeTab ?
								"text-green-600" :
								"text-foreground-muted/50"}`}>
								tab:{i}
							</div>
						)
					})}
				</div>
			}
			<EditorContainer rootId={tabMap[activeTab].root}
				toggleLeaderPanel={toggleLeaderPanel}
				toggleSidebar={toggleSidebar} />
		</div>
	);
}
