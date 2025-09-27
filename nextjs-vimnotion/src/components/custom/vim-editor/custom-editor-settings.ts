import { EditorView } from 'codemirror';
import { Vim } from "@replit/codemirror-vim"
import { PanelType, useEditorStore } from '@/store/editor-store';

export const customTheme = EditorView.theme({
	"&": {
		minHeight: "100%",
	},
}, { dark: false });

export const applyCustomVim = ({
	toggleLeaderPanel,
	toggleSidebar,
	splitVertical,
	splitHorizontal,
	closePane,
	createNewTab,
	nextTab,
	prevTab,
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	splitVertical: () => void,
	splitHorizontal: () => void,
	closePane: () => void,
	createNewTab: () => void,
	nextTab: () => void,
	prevTab: () => void,
}) => {
	Vim.defineEx('write', 'w', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			console.log('saving');
		} else if (activePanel === PanelType.SIDEBAR) {
			console.log("saving sidebar");
		}
	});

	Vim.defineEx('quit', 'q', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			closePane();
		}
	});

	Vim.defineEx('split', 'split', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			splitHorizontal();
		}
	});

	Vim.defineEx('vsplit shorthand', 'vs', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			splitVertical();
		}
	});

	Vim.defineEx('vsplit', 'vsplit', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			splitVertical();
		}
	});

	Vim.defineEx('tabnew', 'tabnew', function() {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			createNewTab();
		}
	});

	Vim.defineAction("toggleLeaderPanel", () => {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			toggleLeaderPanel();
		}
	});
	Vim.unmap('<Space>', "false");
	Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', {}, { context: 'normal' });

	Vim.defineAction("toggleSidebar", () => {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			toggleSidebar();
		}
	});
	Vim.unmap('-', "false");
	Vim.mapCommand('-', 'action', 'toggleSidebar', {}, { context: 'normal' });

	Vim.defineAction("nextTab", () => {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			nextTab();
		}
	});
	Vim.unmap('gt', "false");
	Vim.mapCommand('gt', 'action', 'nextTab', {}, { context: 'normal' });

	Vim.defineAction("prevTab", () => {
		const activePanel: PanelType = useEditorStore((state) => state.activePanel);
		if (activePanel === PanelType.MAIN) {
			prevTab();
		}
	});
	Vim.unmap('gT', "false");
	Vim.mapCommand('gT', 'action', 'prevTab', {}, { context: 'normal' });
}
