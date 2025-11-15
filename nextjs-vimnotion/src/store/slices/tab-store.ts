import { TabMap } from "@/types/editor-types";
import { EditorState } from "../editor-store";
import { v4 } from "uuid";

export const createTabSlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	activeTab: "",
	tabArray: [],
	tabMap: {},

	initTabMap: (): void => {
		const newRootId: string = get().newRoot();
		const tabId: string = v4();
		set({
			activeTab: tabId,
			tabArray: [tabId],
			tabMap: {
				[tabId]: {
					lastPane: newRootId,
					root: newRootId,
					numPanes: 1,
					panes: [],
				}
			}
		});
	},

	setActiveTab: (tab: string): void => set({ activeTab: tab }),

	setTabArray: (tabArray: Array<string>): void => set({ tabArray: tabArray }),

	setTabMap: (map: TabMap): void => set({ tabMap: map }),

	createNewTab: (): void => {
		const { tabMap, tabArray, setTabArray, setActiveTab, setTabMap, newRoot, updateActivePane } = get();
		const newTabId: string = v4();
		const rootId: string = newRoot();

		setTabArray([...tabArray, newTabId]);
		setTabMap({
			...tabMap, [newTabId]: {
				numPanes: 1,
				root: rootId,
				lastPane: rootId,
				panes: [rootId],
			}
		});
		setActiveTab(newTabId);
		updateActivePane(rootId);
	},

	selectTab: (tabIndex: number): void => {
		const { tabMap, activeTab, tabArray, activePane, setTabMap, setActiveTab, updateActivePane } = get();
		const tabId: string = tabArray[tabIndex];
		if (!tabId) {
			return;
		}
		setTabMap({ ...tabMap, [activeTab]: { ...tabMap[activeTab], lastPane: activePane } });
		setActiveTab(tabId);
		updateActivePane(tabMap[tabId].lastPane);
	},

	nextTab: (): void => {
		const { activeTab, tabArray, tabMap, activePane, setActiveTab, setTabMap, updateActivePane } = get();
		setTabMap({ ...tabMap, [activeTab]: { ...tabMap[activeTab], lastPane: activePane } });

		let tabIndex: number = tabArray.indexOf(activeTab) + 1;
		tabIndex = tabIndex >= tabArray.length ? 0 : tabIndex;

		setActiveTab(tabArray[tabIndex]);
		updateActivePane(tabMap[tabArray[tabIndex]].lastPane);
	},

	prevTab: (): void => {
		const { activeTab, tabArray, tabMap, activePane, setActiveTab, setTabMap, updateActivePane } = get();
		setTabMap({ ...tabMap, [activeTab]: { ...tabMap[activeTab], lastPane: activePane } });

		let tabIndex: number = tabArray.indexOf(activeTab) - 1;
		tabIndex = tabIndex < 0 ? (tabArray.length - 1) : tabIndex;

		setActiveTab(tabArray[tabIndex]);
		updateActivePane(tabMap[tabArray[tabIndex]].lastPane);
	},

	deleteTab: (): void => {
		const { tabArray, tabMap, activeTab,
			setTabMap, setTabArray, prevTab } = get();
		const newTabMap: TabMap = { ...tabMap };
		delete newTabMap[activeTab];
		const newTabArray: string[] = tabArray.filter(tabId => tabId !== activeTab);

		if (newTabArray.length > 0) {
			prevTab();
		}
		setTabMap(newTabMap);
		setTabArray(newTabArray);
	},
});
