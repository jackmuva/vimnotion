import { create } from 'zustand'
import { PaneNode, SplitState, Direction, ChildType, PanelType } from "@/types/editor-types";
import { TabMap } from '@/types/editor-types';
import { DirectoryChanges, DirectoryTree } from '@/types/sidebar-types';
import { createToggleSlice } from './slices/toggle-store';
import { createPanelSlice, DrillDownResult } from './slices/panel-store';
import { createTabSlice } from './slices/tab-store';
import { createDirectorySlice } from './slices/directory-store';
import { createSearchSlice } from './slices/search-store';
import { SearchResults } from '@/types/search-types';

export type EditorState = {
	openSidebar: boolean;
	openLeaderPanel: boolean;
	openWindowPanel: boolean;
	openSearchPanel: boolean;
	openSearchModal: boolean;
	openImageModal: boolean;
	openPublishModal: boolean;

	toggleSidebar: () => void;
	toggleLeaderPanel: () => void;
	toggleWindowPanel: () => void;
	toggleSearchPanel: () => void;
	toggleSearchModal: () => void;
	toggleImageModal: () => void;
	togglePublishModal: () => void;

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

	saveVnObjectBuffer: () => boolean;
	publishVnObject: (publish: boolean) => boolean;

	getPaneById: (paneId: string) => PaneNode;
	updatePane: (pane: PaneNode) => void;

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
	proposedDirectoryState: DirectoryTree;
	editingDirectory: boolean;
	location: string;
	lastValidLocation: string;
	oilLine: string;
	sidebarBufferHistory: string[];
	sidebarBufferMap: { [id: string]: string };
	lastDeleted: DirectoryTree | null;
	directoryConfirmation: boolean;

	setDirectoryState: (tree: DirectoryTree) => void;
	setProposedDirectoryState: (tree: DirectoryTree) => void;
	setEditingDirectory: (isEdit: boolean) => void;

	getLocation: () => string;
	setLocation: (location: string) => void;
	getLastValidLocation: () => string;
	setLastValidLocation: (location: string) => void;
	getOilLine: () => string;
	setOilLine: (line: string) => void;
	pushSidebarBufferHistory: (buffer: string) => void;
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => void;
	setLastDeleted: (delTree: DirectoryTree) => void;
	evaluateOilBufferChanges: () => void;
	setDirectoryConfirmation: (open: boolean) => void;
	detectAllDirectoryChanges: () => DirectoryChanges;
	constructLocationMapHelper: (treeRoot: DirectoryTree) => {
		[uuid: string]: {
			location: string,
			name: string,
			isFile: boolean,
		},
	};
	dedupeProposedDirectory: () => void;

	openFileInBuffer: (id?: string) => void;

	filePaths: { [path: string]: string };
	refreshFilePaths: () => void;
	searchByFilename: (term: string) => SearchResults;
	searchByGrep: (pat: string) => SearchResults;

	newImageUrl: string;
	setNewImageUrl: (url: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
	...createToggleSlice(set, get),
	...createPanelSlice(set, get),
	...createTabSlice(set, get),
	...createDirectorySlice(set, get),
	...createSearchSlice(set, get),
}))
