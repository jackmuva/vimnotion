import { Vim } from "@replit/codemirror-vim"
import { PanelType, PaneNode } from '@/types/editor-types';

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
}: {
	splitVertical: () => void,
	splitHorizontal: () => void,
	closePane: () => void,
	getActivePanel: () => PanelType,
	saveVnObjectBuffer: () => boolean,
	setDirectoryConfirmation: () => void,
	toggleSidebar: () => void,
	renderMdTutor: () => void,
	renderVimTutor: () => void,
	refetchFileInBuffer: (fileId: string) => void,
	getActivePane: () => string,
	getPane: (paneId: string) => PaneNode,
}) => {
	Vim.defineEx('write', 'w', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			saveVnObjectBuffer();
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
		}
	});

	Vim.defineEx('edits', 'e', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			const pane: PaneNode = getPane(getActivePane());
			console.log("pane: ", pane);
			refetchFileInBuffer(pane[Object.keys(pane)[0]].fileId);
		}
	});

	Vim.defineEx('quit', 'q', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			closePane();
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
			toggleSidebar();
		}
	});

	Vim.defineEx('wquit', 'wq', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			saveVnObjectBuffer();
			closePane();
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
