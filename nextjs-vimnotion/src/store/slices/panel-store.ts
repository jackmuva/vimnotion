import { Direction, ChildType, EditorType, PaneNode, SplitState, TabMap, PanelType } from "@/types/editor-types";
import { EditorState } from "../editor-store";
import { v4 } from "uuid";

export interface DrillDownResult {
	nearestId: string;
	stepsAway: number;
}

export const createPanelSlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	activePanel: PanelType.MAIN,
	activePane: "",
	paneTree: {} as PaneNode,

	getPaneById: (paneId: string) => {
		const { paneTree } = get();
		return {
			[paneId]: paneTree[paneId]
		}
	},

	updatePaneById: (paneNode: PaneNode) => {
		const { paneTree } = get();
		const paneId = Object.keys(paneNode);
		if (!paneId) return;
		const newTree = { ...paneTree };
		newTree[paneId[0]] = paneNode[paneId[0]];
		set({ paneTree: newTree });
	},

	getActivePanel: () => { return get().activePanel },
	setActivePanel: (panel: PanelType) => set({ activePanel: panel }),

	setPaneTree: (tree: PaneNode) => set({ paneTree: tree }),
	updateActivePane: (newPane: string) => set({ activePane: newPane }),

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
			editorType: EditorType.VIM,
			buffer: "\n\n\n\n\n\n\n",
			fileId: v4(),
		}
		setPaneTree(newPaneTree);
		return rootId;
	},

	splitPane: (direction: SplitState) => {
		const { paneTree, activePane, activeTab, tabMap, updateActivePane, setPaneTree, setTabMap } = get();
		const firstChildId: string = v4();
		const secondChildId: string = v4();

		const newTabMap: TabMap = tabMap;
		newTabMap[activeTab].numPanes += 1;
		newTabMap[activeTab].panes = [...tabMap[activeTab].panes, firstChildId, secondChildId];
		setTabMap(newTabMap);

		const parentId: string = activePane;
		const newTree: PaneNode = {
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
				editorType: EditorType.VIM,
				buffer: paneTree[parentId].buffer,
				fileId: paneTree[parentId].fileId,
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
				editorType: EditorType.VIM,
				buffer: paneTree[parentId].buffer,
				fileId: paneTree[parentId].fileId,
			}
		};
		setPaneTree(newTree);
		updateActivePane(secondChildId);
	},

	closePane: () => {
		const { paneTree, activePane, activeTab, tabMap,
			setTabMap, updateActivePane, setPaneTree, newRoot,
			deleteTab, createNewTab } = get();
		const newTabMap: TabMap = tabMap;
		newTabMap[activeTab].numPanes -= 1;
		if (tabMap[activeTab].numPanes <= 0) {
			deleteTab();
			if (Object.keys(tabMap).length === 0) {
				createNewTab();
			}
			return;
		}
		setTabMap(newTabMap);

		const newTree: PaneNode = { ...paneTree };
		const nextActiveId: string | null = get().bubbleUp(activePane);
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
		const curId: string | null = get().getSiblingId(paneId);
		if (!curId) {
			return null;
		}
		if (paneTree[curId].state === SplitState.NONE && !paneTree[curId].deleted) {
			return curId;
		}
		if (!paneTree[curId].deleted) {
			const firstChild: DrillDownResult = get().drillDown(paneTree[curId].children[0], 1);
			const secondChild: DrillDownResult = get().drillDown(paneTree[curId].children[1], 1);
			if (firstChild.stepsAway >= 0 || secondChild.stepsAway >= 0) {
				if (firstChild.stepsAway < 0) return secondChild.nearestId;
				if (secondChild.stepsAway < 0) return firstChild.nearestId;
				return firstChild.stepsAway <= secondChild.stepsAway ? firstChild.nearestId : secondChild.nearestId;
			}
		}
		const parentId: string | null = paneTree[paneId].parent ?? null;
		return parentId ? get().bubbleUp(parentId) : null;
	},

	drillDown: (paneId: string, curStepsAway: number): DrillDownResult => {
		const { paneTree } = get();
		if (paneTree[paneId].state === SplitState.NONE && !paneTree[paneId].deleted) {
			return { nearestId: paneId, stepsAway: curStepsAway };
		} else if (paneTree[paneId].state === SplitState.NONE && paneTree[paneId].deleted) {
			return { nearestId: "none", stepsAway: -1 };
		}
		const firstChild: DrillDownResult = get().drillDown(paneTree[paneId].children[0], curStepsAway + 1);
		const secondChild: DrillDownResult = get().drillDown(paneTree[paneId].children[1], curStepsAway + 1);
		if (firstChild.stepsAway < 0 && secondChild.stepsAway < 0) {
			return { nearestId: "none", stepsAway: -1 };
		}
		if (firstChild.stepsAway < 0) return secondChild;
		if (secondChild.stepsAway < 0) return firstChild;
		return firstChild.stepsAway <= secondChild.stepsAway ? firstChild : secondChild;
	},

	getSiblingId: (paneId: string): string | null => {
		const { paneTree } = get();
		const parentId: string | null = paneTree[paneId].parent;
		if (parentId !== null && parentId !== undefined) {
			return paneTree[parentId].children.filter(childId => childId !== paneId)[0];
		}
		return null;
	},

	drillDownDirectionally: (paneId: string, direction: Direction, childType: ChildType): string => {
		const { paneTree } = get();
		const curPanel = paneTree[paneId];
		let firstOption: string = paneId;
		let secondOption: string = paneId;

		if (curPanel.deleted || curPanel.editorType === EditorType.MARKDOWN) {
			return curPanel.neighbors[direction] ? get().drillDownDirectionally(curPanel.neighbors[direction], direction, childType) : paneId;
		}

		if (curPanel.state === SplitState.NONE) {
			return paneId;
		}

		//NOTE:Horizontal logic
		if (curPanel.state === SplitState.HORIZONTAL
			&& direction === Direction.NORTH) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
		} else if (curPanel.state === SplitState.HORIZONTAL
			&& direction === Direction.SOUTH) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);

		} else if (curPanel.state === SplitState.HORIZONTAL
			&& (direction === Direction.EAST || direction === Direction.WEST)) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === childType
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType !== childType
			)[0], direction, childType);
		}

		//NOTE:Vertical logic
		else if (curPanel.state === SplitState.VERTICAL
			&& direction === Direction.WEST) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
		} else if (curPanel.state === SplitState.VERTICAL
			&& direction === Direction.EAST) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.FIRST
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === ChildType.SECOND
			)[0], direction, childType);

		} else if (curPanel.state === SplitState.VERTICAL
			&& (direction === Direction.SOUTH || direction === Direction.NORTH)) {
			firstOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType === childType
			)[0], direction, childType);
			secondOption = get().drillDownDirectionally(curPanel.children.filter(
				(childId) => paneTree[childId].childType !== childType
			)[0], direction, childType);
		}
		return firstOption === paneId ? secondOption : firstOption;
	},

	goToNeighbor: (paneId: string, direction: Direction): string => {
		const { paneTree, drillDownDirectionally } = get();

		let currentId: string = paneId;
		const childType: ChildType = paneTree[paneId].childType;
		let resId: string = paneId;
		while (currentId !== null) {
			const currentPane = paneTree[currentId];
			if (!currentPane) break;
			const neighborId: string | null = currentPane.neighbors[direction];
			if (neighborId) {
				resId = drillDownDirectionally(neighborId, direction, childType);
			}
			if (resId !== paneId) {
				return resId
			}
			//@ts-expect-error can be null or string
			currentId = currentPane.parent;
		}
		return resId;
	},

	cycleNeighbor: (): string => {
		const { activePane, tabMap, activeTab, paneTree } = get();

		const startingPane: string = activePane;
		const paneArray: Array<string> = tabMap[activeTab].panes;
		let curPane: string = startingPane;
		let justStarting: boolean = true;

		while (curPane !== startingPane || justStarting) {
			if (justStarting) justStarting = false;
			let paneIndex = paneArray.indexOf(curPane) + 1;
			paneIndex = paneIndex >= paneArray.length ? 0 : paneIndex;
			curPane = paneArray[paneIndex];

			if (paneTree[curPane].state === SplitState.NONE
				&& !paneTree[curPane].deleted
				&& paneTree[curPane].editorType === EditorType.VIM) {
				return curPane;
			}
		}
		return curPane;
	},


});

