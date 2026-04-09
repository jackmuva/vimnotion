import { useEditorStore } from "@/store/editor-store";
import { EditorContainer } from "./editor-container";
import { useEffect, useState } from "react";

export const TabContainer = () => {
	const tabs = useEditorStore(state => state.tabArray);
	const activeTab = useEditorStore(state => state.activeTab);
	const setActiveTab = useEditorStore(state => state.setActiveTab);
	const initTabMap = useEditorStore(state => state.initTabMap);
	const tabMap = useEditorStore(state => state.tabMap);
	const [isClient, setIsClient] = useState(false);
	const toggleSidebar = useEditorStore((state) => state.toggleSidebar);
	const toggleLeaderPanel = useEditorStore((state) => state.toggleLeaderPanel);
	const defaultEditorType = useEditorStore((state) => state.defaultEditorType);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (tabs && tabs.length === 0 && defaultEditorType) {
			console.log("initializing tabs");
			initTabMap();
		}
	}, [tabs, defaultEditorType]);

	if (!isClient || !tabs || tabs.length === 0) {
		return <div className="h-full w-full text-center font-robo-mono">Loading...</div>;
	}
	return (
		<div className="h-full w-full flex flex-col space-y-0 pb-4">
			{tabs.length > 1 &&
				<div className="flex space-x-4 shrink-0">
					{tabs.map((tab, i) => {
						return (
							<div key={tab} className={`cursor-pointer ${tab === activeTab ?
								"text-green-600" :
								"text-foreground-muted/50"}`}
								onClick={() => {
									setActiveTab(tab);
								}}>
								tab:{i}
							</div>
						)
					})}
				</div>
			}
			<div className="flex-1 min-h-0">
				<EditorContainer rootId={tabMap[activeTab].root}
					toggleLeaderPanel={toggleLeaderPanel}
					toggleSidebar={toggleSidebar} />
			</div>
		</div>
	);
}
