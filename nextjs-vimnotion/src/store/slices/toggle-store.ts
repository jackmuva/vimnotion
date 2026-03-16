import { PanelType } from "@/types/editor-types";
import { StoreSetter, StoreGetter } from "../../types/store-types";
import { SearchType } from "@/types/search-types";

export const createToggleSlice = (
	set: StoreSetter,
	get: StoreGetter
) => ({
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

		set({ openSidebar: !openSidebar });

	},

	toggleWindowPanel: () => {
		const windowPanel = get().openWindowPanel;
		if (!windowPanel) {
			get().setActivePanel(PanelType.LEADER);
		} else {
			get().setActivePanel(PanelType.MAIN);
		}
		set({ openWindowPanel: !windowPanel });
	},

	toggleLeaderPanel: () => {
		const leaderPanel = get().openLeaderPanel;
		if (leaderPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openLeaderPanel: !leaderPanel });
	},

	toggleSearchPanel: () => {
		const searchPanel = get().openSearchPanel;
		if (searchPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openSearchPanel: !searchPanel });
	},

	toggleAiPanel: () => {
		const aiPanel = get().openAiPanel;
		if (aiPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
		}

		set({ openAiPanel: !aiPanel });
	},

	setSearchModal: (searchType: SearchType | null) => {
		const searchModal = get().searchModal;
		if (searchModal) {
			get().setActivePanel(PanelType.MAIN);
			set({ searchModal: null });
		} else {
			get().setActivePanel(PanelType.MODAL);
			set({ searchModal: searchType });
		}
	},

	toggleImageModal: () => {
		const imageModal = get().openImageModal;
		if (imageModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openImageModal: !imageModal });
	},

	togglePublishModal: () => {
		const publishModal = get().openPublishModal;
		if (publishModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openPublishModal: !publishModal });
	},

	toggleAsciiModal: () => {
		const aiModal = get().openAsciiModal;
		if (aiModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}
		set({ openAsciiModal: !aiModal });
	},

});
