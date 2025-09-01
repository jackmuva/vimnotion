import { create } from 'zustand'
import { v4 } from "uuid";
import { PaneNode, SplitState, Direction, ChildType } from "@/types/editor-types";
import { TabMap } from '@/types/editor-types';

type EditorState = {
	activePane: string,
	paneTree: PaneNode,
	activePanel: string | null,
	cycleState: Direction,
	setCycleState: (cycle: Direction) => void,
	updateActivePane: (newPane: string) => void,
	setPaneTree: (tree: PaneNode) => void,
	setActivePanel: (panel: string | null) => void,
	newRoot: () => string,
	splitPane: (direction: SplitState) => void,
	closePane: () => void,
	bubbleUp: (paneId: string) => string | null,
	drillDown: (paneId: string, curStepsAway: number) => { nearestId: string, stepsAway: number },
	getSiblingId: (paneId: string) => string | null,
	goToNeighbor: (direction: Direction) => string,
	cycleNeighbor: () => string,
	drillDownDirectionally: (paneId: string, direction: Direction, childType: ChildType) => string,

	activeTab: string,
	tabArray: Array<string>,
	tabMap: TabMap,
	setActiveTab: (tab: string) => void,
	setTabArray: (tabArray: Array<string>) => void,
	setTabMap: (map: TabMap) => void,
	initTabMap: () => void,
	createNewTab: () => void,
	selectTab: (tabIndex: number) => void,
}

export const useEditorStore = create<EditorState>((set, get) => ({
	activePane: "",
	paneTree: {} as PaneNode,
	activePanel: null,
	cycleState: Direction.EAST,

	updateActivePane: (newPane) => set({ activePane: newPane }),

	setPaneTree: (tree: PaneNode) => set({ paneTree: tree }),

	setActivePanel: (panel: string | null) => set({ activePanel: panel }),

	setCycleState: (direction: Direction) => set({ cycleState: direction }),

	newRoot: () => {
		const rootId = v4();
		const { paneTree, setPaneTree } = get();
		const newPaneTree = paneTree;
		newPaneTree[rootId] = {
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
		setPaneTree(newPaneTree);
		return rootId;
	},

	splitPane: (direction: SplitState) => {
		const { paneTree, activePane, activeTab, tabMap, updateActivePane, setPaneTree, setTabMap } = get();
		const newTabMap = tabMap;
		newTabMap[activeTab].numPanes += 1;
		setTabMap(newTabMap);

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
		const { paneTree, activePane, activeTab, tabMap, setTabMap, updateActivePane, setPaneTree, newRoot } = get();
		const newTabMap = tabMap;
		newTabMap[activeTab].numPanes -= 1;
		if (tabMap[activeTab].numPanes <= 0) {
			const rootId = newRoot();
			newTabMap[activeTab] = {
				lastPane: rootId,
				root: rootId,
				numPanes: 1
			}
			setTabMap(newTabMap);
			return;
		}
		setTabMap(newTabMap);

		const newTree = { ...paneTree };
		const nextActiveId = get().bubbleUp(activePane);
		if (!nextActiveId) {
			newRoot();
			return;
		}
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

	drillDownDirectionally: (paneId: string, direction: Direction, childType: ChildType) => {
		const { paneTree } = get();
		const curPanel = paneTree[paneId];
		let firstOption = paneId;
		let secondOption = paneId;

		if (curPanel.state === SplitState.NONE && !curPanel.deleted) {
			return paneId;
		}
		//NOTE:Horizontal logic
		if (curPanel.state === SplitState.HORIZONTAL && direction === Direction.NORTH) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
		} else if (curPanel.state === SplitState.HORIZONTAL && direction === Direction.SOUTH) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);

		} else if (curPanel.state === SplitState.HORIZONTAL &&
			(direction === Direction.EAST || direction === Direction.WEST)) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === childType
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType !== childType
			)[0], direction, childType);
		}

		//NOTE:Vertical logic
		else if (curPanel.state === SplitState.VERTICAL && direction === Direction.WEST) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
		} else if (curPanel.state === SplitState.VERTICAL && direction === Direction.EAST) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);

		} else if (curPanel.state === SplitState.VERTICAL &&
			(direction === Direction.SOUTH || direction === Direction.NORTH)) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === childType
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType !== childType
			)[0], direction, childType);
		}
		return firstOption === paneId ? secondOption : firstOption;
	},

	goToNeighbor: (direction: Direction): string => {
		const { paneTree, activePane, drillDownDirectionally } = get();

		let currentId = activePane;
		const childType = paneTree[activePane].childType;
		let resId = activePane;
		while (currentId !== null) {
			const currentPane = paneTree[currentId];
			if (!currentPane) break;
			const neighborId = currentPane.neighbors[direction];
			if (neighborId) {
				resId = drillDownDirectionally(neighborId, direction, childType);
			}
			if (resId !== activePane) {
				return resId
			}
			//@ts-expect-error can be null or string
			currentId = currentPane.parent;
		}
		return resId;
	},

	//BUG: can still improve; doesnt always cycle optimally because of the cycle order
	cycleNeighbor: () => {
		const { goToNeighbor, activePane, setCycleState } = get();
		let neighbor = activePane;
		let numCycles = 0;
		while (numCycles < 4) {
			neighbor = goToNeighbor(get().cycleState);
			if (neighbor !== activePane) {
				return neighbor;
			}
			if (get().cycleState === Direction.EAST) {
				setCycleState(Direction.SOUTH);
			} else if (get().cycleState === Direction.SOUTH) {
				setCycleState(Direction.WEST);
			} else if (get().cycleState === Direction.WEST) {
				setCycleState(Direction.NORTH);
			} else if (get().cycleState === Direction.NORTH) {
				setCycleState(Direction.EAST);
			}
			numCycles += 1;
		}
		return activePane;
	},

	activeTab: "",
	tabArray: [],
	tabMap: {},

	initTabMap: () => {
		const newRootId = get().newRoot();
		const tabId = v4();
		set({
			activeTab: tabId,
			tabArray: [tabId],
			tabMap: {
				[tabId]: {
					lastPane: newRootId,
					root: newRootId,
					numPanes: 1,
				}
			}
		});
	},

	setActiveTab: (tab: string) => set({ activeTab: tab }),

	setTabArray: (tabArray: Array<string>) => set({ tabArray: tabArray }),

	setTabMap: (map: TabMap) => set({ tabMap: map }),

	createNewTab: () => {
		const { tabMap, tabArray, setTabArray, setActiveTab, setTabMap, newRoot, updateActivePane } = get();
		const newTabId = v4();
		const rootId = newRoot();

		setTabArray([...tabArray, newTabId]);
		setTabMap({
			...tabMap, [newTabId]: {
				numPanes: 1,
				root: rootId,
				lastPane: rootId,
			}
		});
		setActiveTab(newTabId);
		updateActivePane(rootId);
	},

	selectTab: (tabIndex: number) => {
		const { tabMap, tabArray, setActiveTab, updateActivePane } = get();
		const tabId = tabArray[tabIndex];
		if (!tabId) {
			return;
		}
		setActiveTab(tabId);
		updateActivePane(tabMap[tabId].lastPane);
	},
}))
