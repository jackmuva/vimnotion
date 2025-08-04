import { EditorView } from 'codemirror';
import { Vim } from "@replit/codemirror-vim"

export const customTheme = EditorView.theme({
	"&": {
		minHeight: "100%",
	},
}, { dark: false });

export const applyCustomVim = ({ toggleLeaderPanel, toggleSidebar }:
	{ toggleLeaderPanel: () => void, toggleSidebar: () => void }) => {
	Vim.defineEx('write', 'w', function() {
		console.log('saving');
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
