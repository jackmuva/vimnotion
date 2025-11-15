import { DirectoryObjectType, DirectoryTree } from "@/types/sidebar-types";
import { EditorState } from "../editor-store";
import { v4 } from "uuid";

export const createDirectorySlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	directoryState: {},
	proposedDirectoryState: {},
	editingDirectory: false,
	location: "",
	oilLine: "",
	sidebarBufferHistory: [],
	sidebarBufferMap: {},
	lastDeleted: null,
	directoryConfirmation: true,

	setDirectoryState: (tree: DirectoryTree): void => set({ directoryState: tree }),
	setProposedDirectoryState: (tree: DirectoryTree): void => set({ proposedDirectoryState: tree }),
	setEditingDirectory: (isEdit: boolean) => set({ editingDirectory: isEdit }),

	getLocation: () => get().location,
	setLocation: (location: string) => set({ location: location }),

	getOilLine: (): string => get().oilLine,
	setOilLine: (line: string): void => {
		console.log("oil line: ", get().sidebarBufferMap[line]);
		set({ oilLine: get().sidebarBufferMap[line] })
	},
	pushSidebarBufferHistory: (buffer: string) => {
		let bufferHistory: string[] = get().sidebarBufferHistory;
		bufferHistory.push(buffer);
		if (bufferHistory.length > 2) bufferHistory = bufferHistory.slice(-2);
		set({ sidebarBufferHistory: bufferHistory })
	},
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => set({ sidebarBufferMap: bufferMap }),

	setLastDeleted: (delTree: DirectoryTree) => {
		console.log("setting deleted: ", delTree);
		set({ lastDeleted: delTree })
	},

	//TODO:Copy functionality
	evaluateOilBufferChanges: () => {
		const newBuffer: string | undefined = get().sidebarBufferHistory.at(-1);
		const oldBuffer: string | undefined = get().sidebarBufferHistory.at(-2);
		const toDelete: { [id: string]: string } = { ...get().sidebarBufferMap };
		const newDirectoryState: DirectoryTree = { ...get().directoryState };
		const bufferMap: { [id: string]: string } = { ...get().sidebarBufferMap };
		const lastDeleted: DirectoryTree | null = get().lastDeleted

		//NOTE:gets leaf at location
		let leafAtLocation: { type: DirectoryObjectType, children: DirectoryTree } | null = null;
		const locationArray = get().location.split("/");
		locationArray.pop();
		if (locationArray.length > 0) {
			leafAtLocation = newDirectoryState[locationArray[0] + "/"];
		} else {
			return null;
		}
		for (const loc of locationArray.slice(1)) {
			leafAtLocation = leafAtLocation.children[loc + "/"];
		}

		//NOTE:removes existing keys so newBuffer is only new files
		const newBufferLinesMap: { [line: string]: boolean } = {};
		newBuffer!.split("\n").forEach((line) => {
			newBufferLinesMap[line] = true;
		});
		for (const fn of Object.keys(get().sidebarBufferMap)) {
			if (fn in newBufferLinesMap) {
				delete newBufferLinesMap[fn];
				delete toDelete[fn];
			}
		}

		//NOTE:Renames
		const renames: { [newName: string]: string } = {};
		const newBufferLines: string[] = newBuffer!.split("\n");
		const oldBufferLines: string[] = oldBuffer!.split("\n");
		for (let i = 0; i < newBufferLines.length; i++) {
			if (newBufferLines[i] && i < oldBufferLines.length && bufferMap[oldBufferLines[i]]) {
				bufferMap[newBufferLines[i]] = bufferMap[oldBufferLines[i]].split("|")[0] + "|" + newBufferLines[i];
				renames[newBufferLines[i]] = oldBufferLines[i];
			}
		}

		//NOTE:new files
		for (const fn of Object.keys(newBufferLinesMap)) {
			if (!fn) continue;
			if (lastDeleted && fn === Object.keys(lastDeleted)[0].split("|")[1]) {
				const fullId: string = Object.keys(lastDeleted)[0];
				leafAtLocation.children[fullId] = lastDeleted[fullId];
				bufferMap[fullId.split("|")[1]] = fullId;
			} else if (fn in renames) {
				const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
					type: leafAtLocation.children[bufferMap[renames[fn]]].type,
					children: leafAtLocation.children[bufferMap[renames[fn]]].children,
				}
				if (leafAtLocation && fn) {
					leafAtLocation.children[bufferMap[renames[fn]].split("|")[0] + "|" + fn] = newTree;
				} else if (fn) {
					newDirectoryState[bufferMap[renames[fn]].split("|")[0] + "|" + fn] = newTree;
				}
			} else {
				console.log("new file");
				const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
					type: fn.at(fn.length - 1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
					children: {},
				}
				const uuid: string = v4();
				bufferMap[fn] = uuid + "|" + fn;
				if (leafAtLocation && fn) {
					leafAtLocation.children[uuid + "|" + fn] = newTree;
				} else if (fn) {
					newDirectoryState[uuid + "|" + fn] = newTree;
				}
			}
		}

		//NOTE:delete old files
		for (const fn of Object.keys(toDelete)) {
			get().setLastDeleted({ [toDelete[fn]]: { ...leafAtLocation.children[toDelete[fn]] } });
			delete leafAtLocation.children[toDelete[fn]];
			delete bufferMap[fn];
		}
		get().setEditingDirectory(true);
		get().setProposedDirectoryState(newDirectoryState);
		get().setSidebarBufferMap(bufferMap);
	},
	evaluateAllOilBufferChanges: () => { },

	setDirectoryConfirmation: (open: boolean) => set({ directoryConfirmation: open }),
});
