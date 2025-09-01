import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { EditorPane } from "./editor-pane";
import { SplitState } from "@/types/editor-types";

export const EditorContainer = ({
	rootId,
	toggleSidebar,
	toggleLeaderPanel
}: {
	rootId: string,
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void
}) => {
	const [isClient, setIsClient] = useState(false);
	const paneTree = useEditorStore(state => state.paneTree);

	useEffect(() => {
		setIsClient(true);
	}, []);

	//BUG:sometimes closing panes will have an empty pane
	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE && !paneTree[paneId].deleted) {
			return (
				<div key={paneId} className="h-full w-full">
					<EditorPane paneId={paneId}
						toggleSidebar={toggleSidebar}
						toggleLeaderPanel={toggleLeaderPanel} />
				</div>

			);
		} else if (!paneTree[paneId].deleted &&
			(!paneTree[paneTree[paneId].children[0]].deleted ||
				!paneTree[paneTree[paneId].children[1]].deleted)) {
			return (
				<div key={paneId} className={`h-full w-full flex 
				${paneTree[paneId].state === SplitState.HORIZONTAL ?
						"flex-col" : ""}`}>
					{paneTree[paneId].children.map((childId: string) => {
						return hydratePanes(childId)
					})}
				</div>
			)
		}
	}

	console.log(paneTree);

	if (!isClient) {
		return <div className="h-full w-full text-center">Loading...</div>;
	} else {
		return (
			<>
				{hydratePanes(rootId)}
			</>
		);
	}
}


