import { PanelType } from "@/types/editor-types";
import { EditorState } from "../editor-store";

export const createToggleSlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	openSidebar: false,
	openLeaderPanel: false,
	openWindowPanel: false,
	openSearchPanel: false,
	openSearchModal: false,
	openImageModal: false,
	openPublishModal: false,

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
		if (windowPanel) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.LEADER);
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

	toggleSearchModal: () => {
		const searchModal = get().openSearchModal;
		if (searchModal) {
			get().setActivePanel(PanelType.MAIN);
		} else {
			get().setActivePanel(PanelType.MODAL);
		}

		set({ openSearchModal: !searchModal });
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

});
