import { Vim } from "@replit/codemirror-vim"
import { PanelType } from '@/types/editor-types';

export const applyTabBindings = ({
	createNewTab,
	nextTab,
	prevTab,
	getActivePanel,
}: {
	createNewTab: () => void,
	nextTab: () => void,
	prevTab: () => void,
	getActivePanel: () => PanelType,
}) => {
	Vim.defineEx('tabnew', 'tabnew', function() {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.MAIN) {
			createNewTab();
		}
	});

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
