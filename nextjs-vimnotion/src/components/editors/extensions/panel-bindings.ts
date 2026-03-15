import { Vim } from "@replit/codemirror-vim"
import { EditorType, PanelType, PaneNode } from '@/types/editor-types';

export const applyPanelBindings = ({
	splitVertical,
	splitHorizontal,
	closePane,
	getActivePanel,
	saveVnObjectBuffer,
	setDirectoryConfirmation,
	toggleSidebar,
	renderMdTutor,
	renderVimTutor,
	refetchFileInBuffer,
	getActivePane,
	getPane,
	updatePane,
}: {
	splitVertical: () => void,
	splitHorizontal: () => void,
	closePane: () => void,
	getActivePanel: () => PanelType,
	saveVnObjectBuffer: () => Promise<boolean>,
	setDirectoryConfirmation: () => void,
	toggleSidebar: () => void,
	renderMdTutor: () => void,
	renderVimTutor: () => void,
	refetchFileInBuffer: (fileId: string) => void,
	getActivePane: () => string,
	getPane: (paneId: string) => PaneNode,
	updatePane: (paneNode: PaneNode) => void,
}) => {
	Vim.defineEx('write', 'w', async function() {
		const activePanel: PanelType = getActivePanel();
		const paneData = getPane(getActivePane())[getActivePane()];
		if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
			await saveVnObjectBuffer();
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
		}
	});

	Vim.defineEx('edits', 'e', function() {
		const activePanel: PanelType = getActivePanel();
		const paneData = getPane(getActivePane())[getActivePane()];
		if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
			const pane: PaneNode = getPane(getActivePane());
			refetchFileInBuffer(pane[Object.keys(pane)[0]].fileId);
		}
	});

	Vim.defineEx('quit', 'q', function() {
		const activePanel: PanelType = getActivePanel();
		const paneData = getPane(getActivePane())[getActivePane()];
		if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
			closePane();
		} else if (activePanel === PanelType.MAIN && paneData.editorType === EditorType.AGENT) {
			const fileId: string = getPane(getActivePane())[getActivePane()].fileId;
			if (fileId === "START_PAGE") {
				closePane();
			} else {
				updatePane({
					[getActivePane()]: {
						...paneData,
						editorType: EditorType.VIM,
					}
				});
				refetchFileInBuffer(fileId);
			}
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
			toggleSidebar();
		}
	});

	Vim.defineEx('wquit', 'wq', function() {
		const activePanel: PanelType = getActivePanel();
		const paneData = getPane(getActivePane())[getActivePane()];
		if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
			saveVnObjectBuffer();
			closePane();
		} else if (activePanel === PanelType.MAIN && paneData.editorType === EditorType.AGENT) {
			const fileId: string = getPane(getActivePane())[getActivePane()].fileId;
			if (fileId === "START_PAGE") {
				closePane();
			} else {
				updatePane({
					[getActivePane()]: {
						...paneData,
						editorType: EditorType.VIM,
					}
				});
				refetchFileInBuffer(fileId);
			}
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
		}
	});

	Vim.defineEx('split', 'split', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			splitHorizontal();
		}
	});

	Vim.defineEx('vsplit shorthand', 'vs', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			splitVertical();
		}
	});

	Vim.defineEx('vsplit', 'vsplit', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			splitVertical();
		}
	});

	Vim.defineEx('mdtutor', 'mdtutor', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			renderMdTutor();
		}
	});

	Vim.defineEx('vimtutor', 'vimtutor', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			renderVimTutor();
		}
	});

}
