import { PaneNode, SplitState, Direction, ChildType, PanelType, TabMap } from "@/types/editor-types";
import { DirectoryChanges, DirectoryTree } from "@/types/sidebar-types";
import { SearchResults, SearchType } from "@/types/search-types";

export interface DrillDownResult {
	nearestId: string;
	stepsAway: number;
}

export type ToggleState = {
	openSidebar: boolean;
	openLeaderPanel: boolean;
	openWindowPanel: boolean;
	openSearchPanel: boolean;
	openAiPanel: boolean;
	openAsciiModal: boolean;
	searchModal: SearchType | null;
	openImageModal: boolean;
	openPublishModal: boolean;

	toggleSidebar: () => void;
	toggleLeaderPanel: () => void;
	toggleWindowPanel: () => void;
	toggleSearchPanel: () => void;
	toggleAiPanel: () => void;
	setSearchModal: (searchType: SearchType | null) => void;
	toggleImageModal: () => void;
	togglePublishModal: () => void;
	toggleAsciiModal: () => void;
};

export type PanelState = {
	activePane: string;
	paneTree: PaneNode;
	activePanel: PanelType;

	getActivePane: () => string;
	getActivePanel: () => PanelType;
	updateActivePane: (newPane: string) => void;
	getPaneTree: () => PaneNode;
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
	renderMdTutor: () => void;
	renderVimTutor: () => void;
	getPaneById: (paneId: string) => PaneNode;
	updatePane: (pane: PaneNode) => void;
	saveVnObjectBuffer: () => Promise<boolean>;
	publishVnObject: (publish: boolean) => Promise<boolean>;
	updateAllBuffers: (fileId: string, buffer: string) => void;
};

export type TabState = {
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
};

export type DirectoryState = {
	directoryState: DirectoryTree;
	proposedDirectoryState: DirectoryTree;
	editingDirectory: boolean;
	location: string;
	lastValidLocation: string;
	oilLine: string;
	sidebarBufferHistory: string[];
	sidebarBufferMap: { [id: string]: string };
	lastDeleted: DirectoryTree[] | null;
	directoryConfirmation: boolean;
	dirCursorPosition: number;

	setDirectoryState: (tree: DirectoryTree) => void;
	getDirectoryState: () => DirectoryTree;
	setProposedDirectoryState: (tree: DirectoryTree) => void;
	setEditingDirectory: (isEdit: boolean) => void;
	getEditingDirectory: () => boolean;

	getLocation: () => string;
	setLocation: (location: string) => void;
	getLastValidLocation: () => string;
	setLastValidLocation: (location: string) => void;
	getOilLine: () => string;
	setOilLine: (line: string) => void;
	pushSidebarBufferHistory: (buffer: string) => void;
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => void;
	setLastDeleted: (delTree: DirectoryTree[]) => void;
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
	getLocationById: (id: string) => string | null;
	openFileInBuffer: (id?: string) => void;
	setDirCursorPosition: (pos: number) => void;
};

export type SearchState = {
	filePaths: { [path: string]: string };
	refreshFilePaths: () => void;
	searchByFilename: (term: string) => SearchResults;
	searchByGrep: (pat: string) => Promise<SearchResults>;

	newImageUrl: string;
	setNewImageUrl: (url: string) => void;

	newAiBlock: string;
	setNewAiBlock: (url: string) => void;
};

export type EditorState =
	ToggleState &
	PanelState &
	TabState &
	DirectoryState &
	SearchState;

export type StoreSetter = {
	(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
	(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
};

export type StoreGetter = () => EditorState;
