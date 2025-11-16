import { EditorView } from 'codemirror';
import { Vim } from "@replit/codemirror-vim"
import { Prec } from '@codemirror/state';
import { PanelType } from '@/types/editor-types';

export const customTheme = Prec.highest(
	EditorView.theme({
		".cm-fat-cursor": {
			background: "#d2d7c6",
		},
		"&:not(.cm-focused) .cm-fat-cursor": {
			background: "none",
			outline: "solid 1px #d2d7c6",
			color: "transparent !important",
		},
		".cm-gutters": {
			background: "none",
		},
		"&": {
			minHeight: "100%",
		},
	})
);


export const applyCustomVim = ({
	toggleLeaderPanel,
	toggleSidebar,
	splitVertical,
	splitHorizontal,
	closePane,
	createNewTab,
	nextTab,
	prevTab,
	getActivePanel,
	setLocation,
	getLocation,
	getOilLine,
	evaluateAllOilBufferChanges,
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	splitVertical: () => void,
	splitHorizontal: () => void,
	closePane: () => void,
	createNewTab: () => void,
	nextTab: () => void,
	prevTab: () => void,
	getActivePanel: () => PanelType,
	setLocation: (loc: string) => void,
	getLocation: () => string,
	getOilLine: () => string,
	evaluateAllOilBufferChanges: () => void,
}) => {
	Vim.defineEx('write', 'w', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			console.log('saving');
		} else if (activePanel === PanelType.SIDEBAR) {
			evaluateAllOilBufferChanges();
		}
	});

	Vim.defineEx('quit', 'q', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			closePane();
		} else if (activePanel === PanelType.SIDEBAR) {
			toggleSidebar();
		}
	});

	Vim.defineEx('wquit', 'wq', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			closePane();
			console.log('saving');
		} else if (activePanel === PanelType.SIDEBAR) {
			evaluateAllOilBufferChanges();
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

	Vim.defineEx('tabnew', 'tabnew', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			createNewTab();
		}
	});

	Vim.defineAction("goIntoDir", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.SIDEBAR) {
			setLocation(getLocation() + getOilLine());
		}
	});
	Vim.unmap('<CR>', "false");
	Vim.mapCommand('<CR>', 'action', 'goIntoDir', {}, { context: 'normal' });


	Vim.defineAction("toggleLeaderPanel", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			toggleLeaderPanel();
		}
	});
	Vim.unmap('<Space>', "false");
	Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', {}, { context: 'normal' });

	Vim.defineAction("toggleSidebar", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			toggleSidebar();
		} else if (activePanel === PanelType.SIDEBAR) {
			const location = getLocation();
			const locationArr = location.split("/");
			locationArr.pop();
			locationArr.pop();
			setLocation(locationArr && locationArr.length > 0 ? locationArr.join("/") + "/" : "");
		}
	});
	Vim.unmap('-', "false");
	Vim.mapCommand('-', 'action', 'toggleSidebar', {}, { context: 'normal' });

	Vim.defineAction("nextTab", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			nextTab();
		}
	});
	Vim.unmap('gt', "false");
	Vim.mapCommand('gt', 'action', 'nextTab', {}, { context: 'normal' });

	Vim.defineAction("prevTab", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			prevTab();
		}
	});
	Vim.unmap('gT', "false");
	Vim.mapCommand('gT', 'action', 'prevTab', {}, { context: 'normal' });
}
