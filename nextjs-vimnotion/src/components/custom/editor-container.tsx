import { useRef, useState, useEffect } from "react";
import { v4 } from "uuid";
import { useStore } from "@/store/store";
import { EditorPane } from "./editor-pane";

export enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

export type PaneNode = {
	[id: string]: {
		children: Array<string>,
		state: SplitState
	}
}

export const EditorContainer = ({
	toggleSidebar,
	toggleLeaderPanel
}: {
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void
}) => {
	const rootId = useRef<string | null>(null);
	const [isClient, setIsClient] = useState(false);
	const updateActivePane = useStore((state: any) => state.updateActivePane);
	const [paneTree, setPaneTree] = useState<PaneNode>({});
	const [parentMap, setParentMap] = useState<any>({});

	useEffect(() => {
		if (!rootId.current) {
			rootId.current = "root";
			setPaneTree({
				[rootId.current]: {
					state: SplitState.NONE,
					children: [],
				}
			});
		}
		setIsClient(true);
	}, []);

	const splitVertical = () => {
		const childOneId = v4();
		const childTwoId = v4();
		const parentId = useStore.getState().activePane;
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: parentId,
			[childTwoId]: parentId,
		}));
		setPaneTree((prev: PaneNode) => ({
			...prev,
			[parentId]: {
				state: SplitState.VERTICAL,
				children: [...prev[parentId].children, childOneId, childTwoId]
			},
			[childOneId]: {
				state: SplitState.NONE,
				children: [],
			},
			[childTwoId]: {
				state: SplitState.NONE,
				children: [],
			}
		}));
		updateActivePane(childTwoId);
	}

	const splitHorizontal = () => {
		const childOneId = v4();
		const childTwoId = v4();
		const parentId = useStore.getState().activePane;
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: parentId,
			[childTwoId]: parentId,
		}));
		setPaneTree((prev: any) => ({
			...prev,
			[parentId]: {
				state: SplitState.HORIZONTAL,
				children: [...prev[parentId].children, childOneId, childTwoId]
			},
			[childOneId]: {
				state: SplitState.NONE,
				children: [],
			},
			[childTwoId]: {
				state: SplitState.NONE,
				children: [],
			}
		}));
		updateActivePane(childTwoId);
	}

	const closePane = () => {
		const activeId = useStore.getState().activePane;
		const parentId = parentMap[activeId];
		const newTree = { ...paneTree };
		const newMap = { ...parentMap };

		delete newTree[activeId];

		const parentNode = { ...newTree[parentId] };
		parentNode.children = parentNode.children.filter(childId => childId !== activeId);
		newTree[parentId] = parentNode;

		setPaneTree(newTree);
		setParentMap(newMap);
	}

	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE) {
			return (
				<div key={paneId} className="h-full w-full">
					<EditorPane paneId={paneId}
						toggleSidebar={toggleSidebar}
						splitHorizontal={splitHorizontal}
						splitVertical={splitVertical}
						closePane={closePane}
						toggleLeaderPanel={toggleLeaderPanel} />
				</div>

			);
		}
		return (
			<div key={paneId} className={`h-full w-full flex 
				${paneTree[paneId].state === SplitState.HORIZONTAL ?
					"flex-col" : ""}`}>
				{paneTree[paneId].children.map((childId) => {
					return hydratePanes(childId)
				})}
			</div>
		)
	}

	if (!isClient || !rootId.current) {
		return <div className="h-full w-full">Loading...</div>;
	} else {
		return (
			<>
				{hydratePanes(rootId.current)}
			</>
		);
	}
}


