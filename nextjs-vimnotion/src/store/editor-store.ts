import { create } from 'zustand'
import { v4 } from "uuid";
import { PaneNode, SplitState, Direction, ChildType } from "@/types/editor-types";

export const useEditorStore = create((set, get) => ({
	activePane: "root",
	paneTree: {} as PaneNode,
	rootId: null as string | null,
	numPanes: 1,

	resetPane: () => set({ activePane: "root" }),
	updateActivePane: (newPane: string) => set({ activePane: newPane }),
	setPaneTree: (tree: PaneNode) => set({ paneTree: tree }),
	setRootId: (id: string | null) => set({ rootId: id }),
	setNumPanes: (num: number) => set({ numPanes: num }),

	resetRoot: () => {
		const rootId = "root";
		set({
			rootId,
			paneTree: {
				[rootId]: {
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
			},
			numPanes: 1
		});
	},

	splitPane: (direction: SplitState) => {
		const { paneTree, activePane, updateActivePane, setPaneTree, setNumPanes } = get();
		const numPanes = get().numPanes + 1;
		setNumPanes(numPanes);
		const firstChildId = v4();
		const secondChildId = v4();
		const parentId = activePane;
		const newTree = {
			...paneTree,
			[parentId]: {
				...paneTree[parentId],
				state: direction,
				children: [...paneTree[parentId].children, firstChildId, secondChildId]
			},
			[firstChildId]: {
				state: SplitState.NONE,
				children: [],
				parent: parentId,
				neighbors: {
					north: paneTree[parentId].neighbors.north,
					south: direction === SplitState.VERTICAL ? paneTree[parentId].neighbors.south : secondChildId,
					east: direction === SplitState.VERTICAL ? secondChildId : paneTree[parentId].neighbors.east,
					west: paneTree[parentId].neighbors.west,
				},
				childType: ChildType.FIRST,
				deleted: false,
			},
			[secondChildId]: {
				state: SplitState.NONE,
				children: [],
				parent: parentId,
				neighbors: {
					south: paneTree[parentId].neighbors.south,
					north: direction === SplitState.VERTICAL ? paneTree[parentId].neighbors.north : firstChildId,
					west: direction === SplitState.VERTICAL ? firstChildId : paneTree[parentId].neighbors.west,
					east: paneTree[parentId].neighbors.east,
				},
				childType: ChildType.SECOND,
				deleted: false,
			}
		};
		setPaneTree(newTree);
		updateActivePane(secondChildId);
	},

	closePane: () => {
		const { paneTree, activePane, updateActivePane, setPaneTree, setNumPanes, resetRoot } = get();
		const numPanes = get().numPanes - 1;
		if (numPanes <= 0) {
			resetRoot();
			return;
		}
		setNumPanes(numPanes);
		const newTree = { ...paneTree };
		const nextActiveId = get().bubbleUp(activePane);
		newTree[activePane].deleted = true;
		updateActivePane(nextActiveId);
		setPaneTree(newTree);
	},

	bubbleUp: (paneId: string): string | null => {
		const { paneTree } = get();
		const curId = get().getSiblingId(paneId);
		if (!curId) {
			return null;
		}
		if (paneTree[curId].state === SplitState.NONE && !paneTree[curId].deleted) {
			return curId;
		}
		if (!paneTree[curId].deleted) {
			const firstChild = get().drillDown(paneTree[curId].children[0], 1);
			const secondChild = get().drillDown(paneTree[curId].children[1], 1);
			if (firstChild.stepsAway >= 0 || secondChild.stepsAway >= 0) {
				if (firstChild.stepsAway < 0) return secondChild.nearestId;
				if (secondChild.stepsAway < 0) return firstChild.nearestId;
				return firstChild.stepsAway <= secondChild.stepsAway ? firstChild.nearestId : secondChild.nearestId;
			}
		}
		const parentId = paneTree[paneId].parent ?? null;
		return parentId ? get().bubbleUp(parentId) : null;
	},

	drillDown: (paneId: string, curStepsAway: number): { nearestId: string, stepsAway: number } => {
		const { paneTree } = get();
		if (paneTree[paneId].state === SplitState.NONE && !paneTree[paneId].deleted) {
			return { nearestId: paneId, stepsAway: curStepsAway };
		} else if (paneTree[paneId].state === SplitState.NONE && paneTree[paneId].deleted) {
			return { nearestId: "none", stepsAway: -1 };
		}
		const firstChild = get().drillDown(paneTree[paneId].children[0], curStepsAway + 1);
		const secondChild = get().drillDown(paneTree[paneId].children[1], curStepsAway + 1);
		if (firstChild.stepsAway < 0 && secondChild.stepsAway < 0) {
			return { nearestId: "none", stepsAway: -1 };
		}
		if (firstChild.stepsAway < 0) return secondChild;
		if (secondChild.stepsAway < 0) return firstChild;
		return firstChild.stepsAway <= secondChild.stepsAway ? firstChild : secondChild;
	},

	getSiblingId: (paneId: string) => {
		const { paneTree } = get();
		const parentId = paneTree[paneId].parent;
		if (parentId !== null && parentId !== undefined) {
			return paneTree[parentId].children.filter(childId => childId !== paneId)[0];
		}
		return null;
	},

	goToNeighbor: (direction: Direction) => {
		const { paneTree, activePane, updateActivePane } = get();
		let currentId = activePane;

		while (currentId !== null) {
			const currentPane = paneTree[currentId];
			if (!currentPane) break;
			const neighborId = currentPane.neighbors[direction];
			if (neighborId && paneTree[neighborId] && !paneTree[neighborId].deleted) {
				updateActivePane(neighborId);
				return;
			}
			currentId = currentPane.parent;
		}
	},
}))
