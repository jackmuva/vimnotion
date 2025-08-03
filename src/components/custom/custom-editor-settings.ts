import { EditorView } from 'codemirror';
import { Vim } from "@replit/codemirror-vim"

export const customTheme = EditorView.theme({
	"&": {
		minHeight: "100%",
	},
}, { dark: false });

export const applyCustomVim = (toggleLeaderPanel: () => void) => {
	Vim.defineEx('write', 'w', function() {
		console.log('saving');
	});
	Vim.defineAction("toggleLeaderPanel", (cm, args) => {
		toggleLeaderPanel();
		console.log('toggling');
	});
	Vim.unmap('<Space>', "false");
	Vim.mapCommand('<Space>', 'action', 'toggleLeaderPanel', {}, { context: 'normal' });
}
