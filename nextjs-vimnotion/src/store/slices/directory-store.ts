import { DirectoryChanges, DirectoryObjectType, DirectoryTree } from "@/types/sidebar-types";
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
	lastValidLocation: "",
	oilLine: "",
	sidebarBufferHistory: [],
	sidebarBufferMap: {},
	lastDeleted: null,
	directoryConfirmation: false,

	setDirectoryState: (tree: DirectoryTree): void => set({ directoryState: tree }),
	setProposedDirectoryState: (tree: DirectoryTree): void => set({ proposedDirectoryState: tree }),
	setEditingDirectory: (isEdit: boolean) => set({ editingDirectory: isEdit }),

	getLocation: () => get().location,
	setLocation: (location: string) => {
		const locArr: string[] = location.split("/");
		locArr.pop();
		let lastValidIndex: number = 0;
		let cur: { type: DirectoryObjectType; children: DirectoryTree; } = {
			type: DirectoryObjectType.DIRECTORY,
			children: get().directoryState
		};
		for (let i = 0; i < locArr.length; i++) {
			if (locArr[i] + "/" in cur.children) {
				lastValidIndex = i;
				cur = cur.children[locArr[i] + "/"];
			}
		}


		set({
			location: location,
			lastValidLocation: lastValidIndex === 0 ? locArr[0] + "/" : locArr.slice(0, lastValidIndex + 1).join("/") + "/"
		})
	},
	getLastValidLocation: () => get().location,
	setLastValidLocation: (location: string) => set({ location: location }),

	getOilLine: (): string => get().oilLine,
	setOilLine: (line: string): void => {
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
		set({ lastDeleted: delTree })
	},

	//TODO:when a user has folder/folder/file, parse
	//TODO:Copy functionality
	evaluateOilBufferChanges: () => {
		const newBuffer: string | undefined = get().sidebarBufferHistory.at(-1);
		const oldBuffer: string | undefined = get().sidebarBufferHistory.at(-2);
		const toDelete: { [id: string]: string } = { ...get().sidebarBufferMap };
		const proposedDirectoryState: DirectoryTree = { ...get().proposedDirectoryState };
		const bufferMap: { [id: string]: string } = { ...get().sidebarBufferMap };
		const lastDeleted: DirectoryTree | null = get().lastDeleted
		let atRoot: boolean = false;

		//NOTE:gets leaf at location
		let leafAtLocation: { type: DirectoryObjectType, children: DirectoryTree } | null = null;
		const locationArray = get().location.split("/");
		locationArray.pop();
		if (locationArray.length > 0) {
			leafAtLocation = proposedDirectoryState[locationArray[0] + "/"];
			for (const loc of locationArray.slice(1)) {
				leafAtLocation = leafAtLocation.children[loc + "/"];
			}
		} else {
			atRoot = true;
			leafAtLocation = { type: DirectoryObjectType.DIRECTORY, children: { ...proposedDirectoryState } }
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
			//NOTE:Cutting
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
					proposedDirectoryState[bufferMap[renames[fn]].split("|")[0] + "|" + fn] = newTree;
				}
			} else {
				const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
					type: fn.at(fn.length - 1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
					children: {},
				}
				const uuid: string = v4();
				bufferMap[fn] = uuid + "|" + fn;
				if (leafAtLocation && fn) {
					leafAtLocation.children[uuid + "|" + fn] = newTree;
				} else if (fn) {
					proposedDirectoryState[uuid + "|" + fn] = newTree;
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
		get().setProposedDirectoryState(atRoot ? leafAtLocation.children : proposedDirectoryState);
		get().setSidebarBufferMap(bufferMap);
	},

	detectAllDirectoryChanges: (): DirectoryChanges => {
		const res: DirectoryChanges = {
			created: [],
			deleted: [],
			moved: [],
		}
		const oldState: DirectoryTree = get().directoryState;
		const newState: DirectoryTree = get().proposedDirectoryState;

		const oldLocationMap = get().constructLocationMapHelper(oldState);
		const newLocationMap = get().constructLocationMapHelper(newState);

		for (const uuid of Object.keys(oldLocationMap)) {
			if (uuid in newLocationMap) {
				if (newLocationMap[uuid] !== oldLocationMap[uuid]) {
					res.moved.push({ oldLocation: oldLocationMap[uuid], newLocation: newLocationMap[uuid] });
				}
			} else {
				res.deleted.push({ objectLocation: oldLocationMap[uuid] });
			}
		}

		for (const uuid of Object.keys(newLocationMap)) {
			if (!(uuid in oldLocationMap)) {
				res.created.push({ objectLocation: newLocationMap[uuid] });
			}
		}

		return res;
	},

	constructLocationMapHelper: (treeRoot: DirectoryTree): { [uuid: string]: string } => {
		const res: { [uuid: string]: string } = {};
		const q: DirectoryTree[] = [];
		const location: string[] = [];

		for (const key of Object.keys(treeRoot)) {
			q.push({ [key]: treeRoot[key] });
			location.push("");
		}

		while (q.length > 0) {
			const tree: DirectoryTree | undefined = q.shift();
			const loc: string | undefined = location.shift();

			const key = Object.keys(tree!)[0]!;
			const locString: string = loc + "||" + key;
			res[key.split("|")[0]] = locString;
			for (const childKey of Object.keys(tree![key].children)) {
				q.push({ [childKey]: tree![key].children[childKey] });
				location.push(locString);
			}
		}
		return res;
	},

	setDirectoryConfirmation: (open: boolean) => {
		if (!open) {
			get().setLocation(get().lastValidLocation);
		}
		set({ directoryConfirmation: open })
	},
});
