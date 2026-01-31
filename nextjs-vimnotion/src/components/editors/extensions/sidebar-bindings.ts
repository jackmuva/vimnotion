import { Vim } from "@replit/codemirror-vim"
import { PanelType } from '@/types/editor-types';
import { DirectoryChanges } from "@/types/sidebar-types";

export const applySidebarBindings = ({
	toggleLeaderPanel,
	toggleSidebar,
	setLocation,
	getLocation,
	getOilLine,
	openFileInBuffer,
	getActivePanel,
	detectAllDirectoryChanges,
	setDirectoryConfirmation,
}: {
	toggleLeaderPanel: () => void,
	toggleSidebar: () => void,
	setLocation: (loc: string) => void,
	getLocation: () => string,
	getOilLine: () => string,
	openFileInBuffer: () => void,
	getActivePanel: () => PanelType,
	detectAllDirectoryChanges: () => DirectoryChanges,
	setDirectoryConfirmation: () => void,
}) => {
	Vim.defineAction("goIntoDir", () => {
		const activePanel: PanelType = getActivePanel();
		if (activePanel === PanelType.SIDEBAR) {
			const newChanges: DirectoryChanges = detectAllDirectoryChanges();
			if (getOilLine().at(-1) === "/") {
				setLocation(getLocation() + getOilLine());
			} else if (newChanges.created.length !== 0 || newChanges.deleted.length !== 0 || newChanges.moved.length !== 0) {
				setDirectoryConfirmation();
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
		if (activePanel === PanelType.MAIN || activePanel === PanelType.AGENT) {
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
