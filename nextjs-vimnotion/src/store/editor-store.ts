import { create } from 'zustand'
import { PaneNode, SplitState, Direction, ChildType, PanelType } from "@/types/editor-types";
import { TabMap } from '@/types/editor-types';
import { DirectoryTree } from '@/types/sidebar-types';
import { createToggleSlice } from './slices/toggle-store';
import { createPanelSlice, DrillDownResult } from './slices/panel-store';
import { createTabSlice } from './slices/tab-store';
import { createDirectorySlice } from './slices/directory-store';

export type EditorState = {
	openSidebar: boolean;
	openLeaderPanel: boolean;
	openWindowPanel: boolean;

	toggleSidebar: () => void;
	toggleLeaderPanel: () => void;
	toggleWindowPanel: () => void;

	activePane: string;
	paneTree: PaneNode;
	activePanel: PanelType;

	getActivePanel: () => PanelType;
	updateActivePane: (newPane: string) => void;
	setPaneTree: (tree: PaneNode) => void;
	setActivePanel: (panel: PanelType) => void;
	newRoot: () => string;
	splitPane: (direction: SplitState) => void;
	closePane: () => void;
	bubbleUp: (paneId: string) => string | null;
	drillDown: (paneId: string, curStepsAway: number) => DrillDownResult;
	getSiblingId: (paneId: string) => string | null;
	goToNeighbor: (paneId: string, direction: Direction) => string;
	drillDownDirectionally: (paneId: string, direction: Direction, childType: ChildType) => string;
	cycleNeighbor: () => string;

	getPaneById: (paneId: string) => PaneNode;
	updatePaneById: (pane: PaneNode) => void;

	activeTab: string;
	tabArray: string[];
	tabMap: TabMap;
	setActiveTab: (tab: string) => void;
	setTabArray: (tabArray: string[]) => void;
	setTabMap: (map: TabMap) => void;
	initTabMap: () => void;
	createNewTab: () => void;
	selectTab: (tabIndex: number) => void;
	nextTab: () => void;
	prevTab: () => void;
	deleteTab: () => void;

	directoryState: DirectoryTree;
	setDirectoryState: (tree: DirectoryTree) => void;
	proposedDirectoryState: DirectoryTree;
	setProposedDirectoryState: (tree: DirectoryTree) => void;
	editingDirectory: boolean;
	setEditingDirectory: (isEdit: boolean) => void;

	location: string;
	getLocation: () => string;
	setLocation: (location: string) => void;
	oilLine: string;
	getOilLine: () => string;
	setOilLine: (line: string) => void;
	sidebarBuffer: string;
	setSidebarBuffer: (buffer: string) => void;
	sidebarBufferMap: { [id: string]: string };
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => void;

	evaluateOilBufferChanges: () => void;
	evaluateAllOilBufferChanges: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
	...createToggleSlice(set, get),
	...createPanelSlice(set, get),
	...createTabSlice(set, get),
	...createDirectorySlice(set, get),
}))
