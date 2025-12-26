import { Vim } from "@replit/codemirror-vim"
import { PanelType } from '@/types/editor-types';

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
}) => {
	Vim.defineEx('write', 'w', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			saveVnObjectBuffer();
		} else if (activePanel === PanelType.SIDEBAR) {
			setDirectoryConfirmation();
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
