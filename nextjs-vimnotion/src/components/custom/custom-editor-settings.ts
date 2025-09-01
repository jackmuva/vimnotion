import { EditorView } from 'codemirror';
import { Vim } from "@replit/codemirror-vim"

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
		console.log('saving');
	});

	Vim.defineEx('quit', 'q', function() {
		closePane();
	});

	Vim.defineEx('split', 'split', function() {
		splitHorizontal();
	});

	Vim.defineEx('vsplit shorthand', 'vs', function() {
		splitVertical();
	});

	Vim.defineEx('vsplit', 'vsplit', function() {
		splitVertical();
	});

	Vim.defineEx('tabnew', 'tabnew', function() {
		createNewTab();
	});

	Vim.defineAction("toggleLeaderPanel", () => {
		toggleLeaderPanel();
	});
	Vim.unmap('<Space>', "false");
	Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', {}, { context: 'normal' });

	Vim.defineAction("toggleSidebar", () => {
		toggleSidebar();
	});
	Vim.unmap('-', "false");
	Vim.mapCommand('-', 'action', 'toggleSidebar', {}, { context: 'normal' });

	Vim.defineAction("nextTab", () => {
		nextTab();
	});
	Vim.unmap('gt', "false");
	Vim.mapCommand('gt', 'action', 'nextTab', {}, { context: 'normal' });

	Vim.defineAction("prevTab", () => {
		prevTab();
	});
	Vim.unmap('gT', "false");
	Vim.mapCommand('gT', 'action', 'prevTab', {}, { context: 'normal' });
}
