import { useRef, useState, useEffect } from "react";
import { v4 } from "uuid";
import { useStore } from "@/store/store";
import { EditorPane } from "./editor-pane";
import { Split } from "lucide-react";

export enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

export enum ChildType {
	NONE = "NONE",
	FIRST = "FIRST",
	SECOND = "SECOND",
}

export enum Direction {
	NORTH = "NORTH",
	SOUTH = "SOUTH",
	EAST = "EAST",
	WEST = "WEST",
}


export type PaneNeighbors = {
	north: string | null,
	south: string | null,
	east: string | null,
	west: string | null,
}


export type PaneNode = {
	[id: string]: {
		children: Array<string>,
		parent: string | null,
		state: SplitState,
		neighbors: PaneNeighbors,
		childType: ChildType,
		deleted: boolean,
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
	const resetRoot = () => {
		rootId.current = "root";
		setPaneTree({
			[rootId.current]: {
				state: SplitState.NONE,
				children: [],
				parent: null,
				neighbors: {
					north: null,
					south: null,
					east: null,
					west: null,
				},
				childType: ChildType.NONE,
				deleted: false,
			}
		});
	}

	useEffect(() => {
		if (!rootId.current) {
			resetRoot();
		}
		setIsClient(true);
	}, []);

	useEffect(() => {
		const activeId = useStore.getState().activePane;
		const editorElement = document.getElementById(`vim-editor-${activeId}`);
		editorElement?.focus();
	}, [paneTree]);

	const splitPane = (direction: SplitState) => {
		const firstChildId = v4();
		const secondChildId = v4();
		const parentId = useStore.getState().activePane;
		setPaneTree((prev: PaneNode) => ({
			...prev,
			[parentId]: {
				...prev[parentId],
				state: direction,
				children: [...prev[parentId].children, firstChildId, secondChildId]
			},
			[firstChildId]: {
				state: SplitState.NONE,
				children: [],
				parent: parentId,
				neighbors: {
					north: prev[parentId].neighbors.north,
					south: direction === SplitState.VERTICAL ? prev[parentId].neighbors.south :
						secondChildId,
					east: direction === SplitState.VERTICAL ? secondChildId :
						prev[parentId].neighbors.east,
					west: prev[parentId].neighbors.west,
				},
				childType: ChildType.FIRST,
				deleted: false,
			},
			[secondChildId]: {
				state: SplitState.NONE,
				children: [],
				parent: parentId,
				neighbors: {
					south: prev[parentId].neighbors.south,
					north: direction === SplitState.VERTICAL ? prev[parentId].neighbors.north :
						firstChildId,
					west: direction === SplitState.VERTICAL ? firstChildId :
						prev[parentId].neighbors.west,
					east: prev[parentId].neighbors.east,
				},
				childType: ChildType.SECOND,
				deleted: false,
			}
		}));
		updateActivePane(secondChildId);
	}

	const closePane = () => {
		const newTree = { ...paneTree };
		const activeId = useStore.getState().activePane;
		const parentId = paneTree[activeId].parent;
		if (parentId === undefined || parentId === null) {
			resetRoot();
			return;
		} else {
			//TODO: if sibling is deleted, i want to bubble up to parent's sibling
			const siblingId = paneTree[parentId].children.filter(childId => childId !== activeId)[0];
			updateActivePane(siblingId);
		}
		newTree[activeId].deleted = true;
		setPaneTree(newTree);
	}

	//NOTE: use graph traversal to visit parent's neighbors
	export const goToNeighbor = (direction: Direction) => {

	}

	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE && !paneTree[paneId].deleted) {
			return (
				<div key={paneId} className="h-full w-full">
					<EditorPane paneId={paneId}
						toggleSidebar={toggleSidebar}
						splitHorizontal={() => splitPane(SplitState.HORIZONTAL)}
						splitVertical={() => splitPane(SplitState.VERTICAL)}
						closePane={closePane}
						toggleLeaderPanel={toggleLeaderPanel} />
				</div>

			);
		} else if (!paneTree[paneId].deleted) {
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
	}

	console.log(paneTree);

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


