import { useRef, useState, useEffect } from "react";
import { v4 } from "uuid";
import { useStore } from "@/store/store";
import { EditorPane } from "./editor-pane";
import { Split } from "lucide-react";
import { PaneNode, SplitState, Direction, ChildType } from "@/types/editor-types";

export const EditorContainer = ({
	toggleSidebar,
	toggleLeaderPanel
}: {
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void
}) => {
	const rootId = useRef<string | null>(null);
	const numPanes = useRef<number>(1);
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

	const splitPane = (direction: SplitState) => {
		numPanes.current += 1;
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
		numPanes.current -= 1;
		if (numPanes.current <= 0) {
			resetRoot();
			return;
		}

		const newTree = { ...paneTree };
		const activeId = useStore.getState().activePane;
		const nextActiveId = bubbleUp(activeId);

		newTree[activeId].deleted = true;
		updateActivePane(nextActiveId);
		setPaneTree(newTree);
	}

	const bubbleUp = (paneId: string): string | null => {
		let curId = getSiblingId(paneId);
		if (!curId) {
			return null;
		}
		if (paneTree[curId].state === SplitState.NONE && !paneTree[curId].deleted) {
			return curId;
		}
		if (!paneTree[curId].deleted) {
			const firstChild = drillDown(paneTree[curId].children[0], 1);
			const secondChild = drillDown(paneTree[curId].children[1], 1);
			if (firstChild.stepsAway >= 0 || secondChild.stepsAway >= 0) {
				if (firstChild.stepsAway < 0) return secondChild.nearestId;
				if (secondChild.stepsAway < 0) return firstChild.nearestId;
				return firstChild.stepsAway <= secondChild.stepsAway ?
					firstChild.nearestId : secondChild.nearestId;
			}
		}
		const parentId = paneTree[paneId].parent ?? null;
		return parentId ? bubbleUp(parentId) : null
	}

	const drillDown = (paneId: string, curStepsAway: number): { nearestId: string, stepsAway: number } => {
		if (paneTree[paneId].state === SplitState.NONE && !paneTree[paneId].deleted) {
			return { nearestId: paneId, stepsAway: curStepsAway };
		} else if (paneTree[paneId].state === SplitState.NONE && paneTree[paneId].deleted) {
			return { nearestId: "none", stepsAway: -1 }
		}
		const firstChild = drillDown(paneTree[paneId].children[0], curStepsAway + 1);
		const secondChild = drillDown(paneTree[paneId].children[1], curStepsAway + 1);
		if (firstChild.stepsAway < 0 && secondChild.stepsAway < 0) {
			return { nearestId: "none", stepsAway: -1 };
		}
		if (firstChild.stepsAway < 0) return secondChild;
		if (secondChild.stepsAway < 0) return firstChild;
		return firstChild.stepsAway <= secondChild.stepsAway ? firstChild : secondChild;
	}

	const getSiblingId = (paneId: string) => {
		const parentId = paneTree[paneId].parent;
		if (parentId !== null && parentId !== undefined) {
			return paneTree[parentId].children.filter(childId => childId !== paneId)[0];
		}
		return null;
	}

	const goToNeighbor = (direction: Direction) => {
		const currentPaneId = useStore.getState().activePane;
		let currentId = currentPaneId;

		while (currentId !== null) {
			const currentPane = paneTree[currentId];

			if (!currentPane) break;

			// Check if current pane has a neighbor in the requested direction
			const neighborId = currentPane.neighbors[direction];

			if (neighborId && paneTree[neighborId] && !paneTree[neighborId].deleted) {
				// Found a valid neighbor, switch to it
				updateActivePane(neighborId);
				return;
			}

			// No neighbor found at this level, move up to parent
			currentId = currentPane.parent;
		}
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
		} else if (!paneTree[paneId].deleted &&
			(!paneTree[paneTree[paneId].children[0]].deleted ||
				!paneTree[paneTree[paneId].children[1]].deleted)) {
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


