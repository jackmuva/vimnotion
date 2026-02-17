import { PanelType } from "@/types/editor-types";
import { SearchType } from "@/types/search-types";
import { StoreSetter, StoreGetter } from "../store-types";

export type ToggleSlice = {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createToggleSlice = <T extends ToggleSlice & { setActivePanel: (panel: PanelType) => void; setProposedDirectoryState: (tree: any) => void; directoryState: any; setEditingDirectory: (isEdit: boolean) => void }>(
	set: StoreSetter<T>,
	get: StoreGetter<T>
): ToggleSlice => ({
	openSidebar: false,
	openLeaderPanel: false,
	openWindowPanel: false,
	openSearchPanel: false,
	searchModal: null,
	openImageModal: false,
	openPublishModal: false,
	openAiPanel: false,
	openAsciiModal: false,

	toggleSidebar: () => {
		const openSidebar = get().openSidebar;
		if (openSidebar) {
			get().setProposedDirectoryState(structuredClone(get().directoryState));
			get().setEditingDirectory(false);
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.SIDEBAR);
		}

		set({ openSidebar: !openSidebar } as Partial<T>);

	},

	toggleWindowPanel: () => {
		const windowPanel = get().openWindowPanel;
		if (windowPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}
		set({ openWindowPanel: !windowPanel } as Partial<T>);
	},

	toggleLeaderPanel: () => {
		const leaderPanel = get().openLeaderPanel;
		if (leaderPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openLeaderPanel: !leaderPanel } as Partial<T>);
	},

	toggleSearchPanel: () => {
		const searchPanel = get().openSearchPanel;
		if (searchPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openSearchPanel: !searchPanel } as Partial<T>);
	},

	toggleAiPanel: () => {
		const aiPanel = get().openAiPanel;
		if (aiPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openAiPanel: !aiPanel } as Partial<T>);
	},

	setSearchModal: (searchType: SearchType | null) => {
		const searchModal = get().searchModal;
		if (searchModal) {
			get().setActivePanel(PanelType.MAIN);
			set({ searchModal: null } as Partial<T>);
		} else {
			get().setActivePanel(PanelType.MODAL);
			set({ searchModal: searchType } as Partial<T>);
		}
	},

	toggleImageModal: () => {
		const imageModal = get().openImageModal;
		if (imageModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openImageModal: !imageModal } as Partial<T>);
	},

	togglePublishModal: () => {
		const publishModal = get().openPublishModal;
		if (publishModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openPublishModal: !publishModal } as Partial<T>);
	},

	toggleAsciiModal: () => {
		const aiModal = get().openAsciiModal;
		if (aiModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openAsciiModal: !aiModal } as Partial<T>);
	},

});
