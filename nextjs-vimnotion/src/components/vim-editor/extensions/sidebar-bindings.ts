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
		console.log("active panel: ", activePanel);
		if (activePanel === PanelType.SIDEBAR) {
			console.log("in sidebar conditional");
			const newChanges: DirectoryChanges = detectAllDirectoryChanges();
			console.log("new changes: ", newChanges);
			if (getOilLine().at(-1) === "/") {
				console.log("location: ", getLocation() + getOilLine());
				setLocation(getLocation() + getOilLine());
			} else if (newChanges.created.length !== 0 || newChanges.deleted.length !== 0 || newChanges.moved.length !== 0) {
				console.log("cp0");
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
