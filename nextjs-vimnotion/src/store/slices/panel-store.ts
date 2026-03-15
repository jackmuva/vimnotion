import { Direction, ChildType, EditorType, PaneNode, SplitState, TabMap, PanelType } from "@/types/editor-types";
import { v4 } from "uuid";
import { VnObject } from "@/types/primitive-types";
import { MD_TUTOR_BUFFER, START_BUFFER, VIM_TUTOR_BUFFER } from "./tutorial-text";
import { updateVnObject } from "@/services/api-service";
import { StoreSetter, StoreGetter, DrillDownResult } from "../../types/store-types";

//TODO:Splitting panes has weird effects in agent mode
//also, closing agent editor uses the prompt buffer and needs to use the fildid's buffer
export const createPanelSlice = (
	set: StoreSetter,
	get: StoreGetter
) => ({
	activePanel: PanelType.MAIN,
	activePane: "",
	paneTree: {} as PaneNode,

	getActivePane: (): string => get().activePane,

	getPaneById: (paneId: string): PaneNode => {
		const { paneTree } = get();
		return {
			[paneId]: paneTree[paneId]
		}
	},

	updatePane: (paneNode: PaneNode) => {
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
	getPaneTree: () => get().paneTree,
	updateActivePane: (newPane: string) => set({ activePane: newPane }),

	newRoot: () => {
		const rootId = v4();
		const { paneTree, setPaneTree } = get();
		const newPaneTree: PaneNode = paneTree;
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
			buffer: START_BUFFER,
			bufferVersion: 1,
			suggestionState: {
				suggestions: [],
				suggestionOpen: true,
				suggestionActive: false,
				activeSuggestionIndex: 0,
			},
			agentState: {
				messages: [],
				streaming: false,
				sessionId: "",
			},
			fileId: "START_PAGE",
			public: false,
			scrollPosition: 0,
			cursorPosition: 0,
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
				editorType: paneTree[parentId].editorType,
				buffer: paneTree[parentId].buffer,
				bufferVersion: paneTree[parentId].bufferVersion,
				suggestionState: {
					suggestions: paneTree[parentId].suggestionState.suggestions,
					suggestionOpen: paneTree[parentId].suggestionState.suggestionOpen,
					suggestionActive: paneTree[parentId].suggestionState.suggestionActive,
					activeSuggestionIndex: paneTree[parentId].suggestionState.activeSuggestionIndex,
				},
				agentState: {
					messages: paneTree[parentId].agentState.messages,
					streaming: paneTree[parentId].agentState.streaming,
					sessionId: paneTree[parentId].agentState.sessionId,
				},
				fileId: paneTree[parentId].fileId,
				public: paneTree[parentId].public,
				scrollPosition: paneTree[parentId].scrollPosition,
				cursorPosition: paneTree[parentId].cursorPosition,
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
				editorType: paneTree[parentId].editorType,
				buffer: paneTree[parentId].buffer,
				bufferVersion: paneTree[parentId].bufferVersion,
				suggestionState: {
					suggestions: paneTree[parentId].suggestionState.suggestions,
					suggestionOpen: paneTree[parentId].suggestionState.suggestionOpen,
					suggestionActive: paneTree[parentId].suggestionState.suggestionActive,
					activeSuggestionIndex: paneTree[parentId].suggestionState.activeSuggestionIndex,
				},
				agentState: {
					messages: [],
					streaming: false,
					sessionId: "",
				},
				fileId: paneTree[parentId].fileId,
				public: paneTree[parentId].public,
				scrollPosition: paneTree[parentId].scrollPosition,
				cursorPosition: paneTree[parentId].cursorPosition,
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

		if (curPanel.deleted) {
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
		if (paneTree[paneId].suggestionState.suggestionOpen && !paneTree[paneId].suggestionState.suggestionActive && paneTree[paneId].suggestionState.suggestions.length > 0 && direction === Direction.EAST) {
			set({
				paneTree: {
					...paneTree,
					[paneId]: {
						...paneTree[paneId],
						suggestionState: {
							...paneTree[paneId].suggestionState,
							suggestionActive: true,
							activeSuggestionIndex: 0,
						}
					},
				}
			});
			return paneId;
		} else if (paneTree[paneId].suggestionState.suggestionOpen && paneTree[paneId].suggestionState.suggestionActive && paneTree[paneId].suggestionState.suggestions.length > 0 && direction === Direction.WEST) {
			set({
				paneTree: {
					...paneTree,
					[paneId]: {
						...paneTree[paneId],
						suggestionState: {
							...paneTree[paneId].suggestionState,
							suggestionActive: false
						},
					}
				}
			});
			return paneId;
		}

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
				set({ activePanel: PanelType.MAIN });
				return resId
			}
			//@ts-expect-error can be null or string
			currentId = currentPane.parent;
		}
		set({ activePanel: PanelType.MAIN });
		return resId;
	},

	cycleNeighbor: (): string => {
		const { activePane, tabMap, activeTab, paneTree } = get();

		const startingPane: string = activePane;
		const paneArray: Array<string> = tabMap[activeTab].panes;
		let curPane: string = startingPane;
		if (paneArray.length === 0) return curPane;

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

	saveVnObjectBuffer: async (): Promise<boolean> => {
		const activePane: PaneNode = get().getPaneById(get().activePane);
		const paneId: string = Object.keys(activePane)[0];
		const vnObject: VnObject = {
			id: activePane[paneId].fileId.split("|")[0],
			name: activePane[paneId].fileId.split("|")[1],
			isFile: true,
			contents: activePane[paneId].buffer,
			updateDate: (new Date).toISOString(),
			public: activePane[paneId].public,
		}
		return await updateVnObject(vnObject);
	},

	updateAllBuffers: (fileId: string, buffer: string): void => {
		const activePane = get().activePane;
		const newTree: PaneNode = { ...get().paneTree };
		for (const paneId of Object.keys(newTree)) {
			if (newTree[paneId].fileId === fileId && paneId !== activePane) {
				newTree[paneId].buffer = buffer;
				newTree[paneId].bufferVersion = (newTree[paneId].bufferVersion || 0) + 1;
			}
		}
		get().setPaneTree(newTree);
	},

	publishVnObject: async (publish: boolean): Promise<boolean> => {
		const activePane: PaneNode = get().getPaneById(get().activePane);
		const paneId: string = Object.keys(activePane)[0];
		const vnObject: VnObject = {
			id: activePane[paneId].fileId.split("|")[0],
			name: activePane[paneId].fileId.split("|")[1],
			isFile: true,
			contents: activePane[paneId].buffer,
			updateDate: (new Date).toISOString(),
			public: publish,
		}
		const success = await updateVnObject(vnObject);
		if (success) {
			get().updatePane({ [paneId]: { ...activePane[paneId], public: publish } });
		}
		return success;
	},

	renderMdTutor: () => {
		const activePane: PaneNode = { ...get().getPaneById(get().activePane) };
		activePane[Object.keys(activePane)[0]].fileId = "MD_TUTOR";
		activePane[Object.keys(activePane)[0]].buffer = MD_TUTOR_BUFFER;
		get().updatePane(activePane);
	},

	renderVimTutor: () => {
		const activePane: PaneNode = { ...get().getPaneById(get().activePane) };
		activePane[Object.keys(activePane)[0]].fileId = "VIM_TUTOR";
		activePane[Object.keys(activePane)[0]].buffer = VIM_TUTOR_BUFFER;
		get().updatePane(activePane);
	},
});

