import { Vim } from "@replit/codemirror-vim"
import { PanelType } from '@/types/editor-types';

export const applySidebarBindings = ({
	toggleLeaderPanel,
	toggleSidebar,
	setLocation,
	getLocation,
	getOilLine,
	openFileInBuffer,
	getActivePanel,
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	setLocation: (loc: string) => void,
	getLocation: () => string,
	getOilLine: () => string,
	openFileInBuffer: () => void,
	getActivePanel: () => PanelType,
}) => {
	Vim.defineAction("goIntoDir", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.SIDEBAR) {
			if (getOilLine().at(-1) === "/") {
				setLocation(getLocation() + getOilLine());
			} else {
				openFileInBuffer();
				toggleSidebar();
			}
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


}
