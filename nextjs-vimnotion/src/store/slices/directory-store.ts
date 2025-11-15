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
	setDirectoryState: (tree: DirectoryTree): void => set({ directoryState: tree }),
	proposedDirectoryState: {},
	setProposedDirectoryState: (tree: DirectoryTree): void => set({ proposedDirectoryState: tree }),
	editingDirectory: false,
	setEditingDirectory: (isEdit: boolean) => set({ editingDirectory: isEdit }),

	location: "",
	getLocation: () => get().location,
	setLocation: (location: string) => set({ location: location }),

	oilLine: "",
	getOilLine: (): string => get().oilLine,
	setOilLine: (line: string): void => {
		console.log("oil line: ", get().sidebarBufferMap[line]);
		set({ oilLine: get().sidebarBufferMap[line] })
	},
	sidebarBuffer: "",
	setSidebarBuffer: (buffer: string) => set({ sidebarBuffer: buffer }),
	sidebarBufferMap: {},
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => set({ sidebarBufferMap: bufferMap }),

	evaluateOilBufferChanges: () => {
		const newBuffer = get().sidebarBuffer;
		const toDelete = { ...get().sidebarBufferMap };
		const newDirectoryState = { ...get().directoryState };
		const newBufferMap = { ...get().sidebarBufferMap };

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
		const newBufferLines: { [line: string]: boolean } = {};
		newBuffer.split("\n").forEach((line) => {
			newBufferLines[line] = true;
		});
		for (const fn of Object.keys(get().sidebarBufferMap)) {
			if (fn in newBufferLines) {
				delete newBufferLines[fn];
				delete toDelete[fn];
			}
		}

		//NOTE:new files
		for (const fn of Object.keys(newBufferLines)) {
			if (!fn) continue;
			const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
				type: fn.at(fn.length - 1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
				children: {},
			}
			const uuid: string = v4();
			newBufferMap[fn] = uuid + "|" + fn;
			if (leafAtLocation && fn) {
				leafAtLocation.children[uuid + "|" + fn] = newTree;
			} else if (fn) {
				newDirectoryState[uuid + "|" + fn] = newTree;
			}
		}

		//NOTE:delete old files
		for (const fn of Object.keys(toDelete)) {
			delete leafAtLocation.children[toDelete[fn]];
			delete newBufferMap[fn];
		}
		get().setEditingDirectory(true);
		get().setProposedDirectoryState(newDirectoryState);
		get().setSidebarBufferMap(newBufferMap);
	},
	evaluateAllOilBufferChanges: () => { },
});
