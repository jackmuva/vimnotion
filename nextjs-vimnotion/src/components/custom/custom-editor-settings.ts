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
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	splitVertical: () => void,
	splitHorizontal: () => void,
	closePane: () => void,
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

	Vim.defineAction("toggleLeaderPanel", (cm, args) => {
		toggleLeaderPanel();
	});
	Vim.unmap('<Space>', "false");
	Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', {}, { context: 'normal' });

	Vim.defineAction("toggleSidebar", (cm, args) => {
		toggleSidebar();
	});
	Vim.unmap('-', "false");
	Vim.mapCommand('-', 'action', 'toggleSidebar', {}, { context: 'normal' });
}
