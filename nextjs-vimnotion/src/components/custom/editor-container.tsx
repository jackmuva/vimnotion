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
	const resetRoot = () => {
		rootId.current = "root";
		setPaneTree({
			[rootId.current]: {
				state: SplitState.NONE,
				children: [],
			}
		});
		setParentMap({});
	}

	useEffect(() => {
		if (!rootId.current) {
			resetRoot();
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
		const newTree = { ...paneTree };
		const newMap = { ...parentMap };
		const activeId = useStore.getState().activePane;
		const parentId = parentMap[activeId];
		if (parentId === undefined) {
			resetRoot();
			return;
		}

		delete newTree[activeId];
		delete newTree[parentId];
		delete newMap[activeId];
		delete newMap[parentId];

		const siblingId = paneTree[parentId].children.filter(childId => childId !== activeId)[0];
		const grandparentId = parentMap[parentId];
		if (grandparentId === undefined) {
			rootId.current = siblingId;
			delete newMap[siblingId];
		} else {
			const grandparentNode = { ...newTree[grandparentId] };
			grandparentNode.children = grandparentNode.children.filter(childId => childId !== parentId);
			grandparentNode.children.push(siblingId);
			newTree[grandparentId] = grandparentNode;
			newMap[siblingId] = grandparentId;
		}

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
		return <div className="h-full w-full text-center">Loading...</div>;
	} else {
		return (
			<>
				{hydratePanes(rootId.current)}
			</>
		);
	}
}


