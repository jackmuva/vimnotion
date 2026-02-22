import { Vim } from "@replit/codemirror-vim"
import { PanelType } from '@/types/editor-types';

export const applySidebarBindings = ({
	toggleLeaderPanel,
	toggleSidebar,
	setLocation,
	getLocation,
	getActivePanel,
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	setLocation: (loc: string) => void,
	getLocation: () => string,
	getActivePanel: () => PanelType,
}) => {
	Vim.defineAction("toggleLeaderPanel", () => {
		toggleLeaderPanel();
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


}
