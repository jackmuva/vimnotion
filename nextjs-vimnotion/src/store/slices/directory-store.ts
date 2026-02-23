import { DirectoryChanges, DirectoryObjectType, DirectoryTree } from "@/types/sidebar-types";
import { v4 } from "uuid";
import { PaneNode } from "@/types/editor-types";
import { getVnObjectById } from "@/services/api-service";
import { VnObject } from "@/types/primitive-types";
import { StoreSetter, StoreGetter } from "../../types/store-types";

export const createDirectorySlice = (
	set: StoreSetter,
	get: StoreGetter
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
	getDirectoryState: (): DirectoryTree => get().directoryState,
	setProposedDirectoryState: (tree: DirectoryTree): void => set({ proposedDirectoryState: tree }),
	setEditingDirectory: (isEdit: boolean) => set({ editingDirectory: isEdit }),
	getEditingDirectory: () => get().editingDirectory,

	getLocation: () => get().location,
	setLocation: (location: string) => {
		//NOTE:Check for last valid location
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

	setLastDeleted: (delTrees: DirectoryTree[]) => {
		set({ lastDeleted: delTrees })
	},

	//TODO:when a user has folder/folder/file, parse
	//TODO:Copy functionality
	evaluateOilBufferChanges: () => {
		const newBuffer: string | undefined = get().sidebarBufferHistory.at(-1);
		const oldBuffer: string | undefined = get().sidebarBufferHistory.at(-2);
		const toDelete: { [id: string]: string } = { ...get().sidebarBufferMap };
		const proposedDirectoryState: DirectoryTree = { ...get().proposedDirectoryState };
		const bufferMap: { [id: string]: string } = { ...get().sidebarBufferMap };
		const lastDeleted: DirectoryTree[] | null = get().lastDeleted
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
			if (newBufferLines[i] && i < oldBufferLines.length && bufferMap[oldBufferLines[i]] && !oldBufferLines.includes(newBufferLines[i])) {
				bufferMap[newBufferLines[i]] = bufferMap[oldBufferLines[i]].split("|")[0] + "|" + newBufferLines[i];
				renames[newBufferLines[i]] = oldBufferLines[i];
			}
		}

		for (const fn of Object.keys(newBufferLinesMap)) {
			if (!fn) continue;
			if (lastDeleted && lastDeleted.map((tree) => Object.keys(tree)[0].split("|")[1]).includes(fn)) {
				const lastDeletedTree: DirectoryTree = lastDeleted.filter((tree) => (fn === Object.keys(tree)[0].split("|")[1]))[0];
				const fullId: string = Object.keys(lastDeletedTree)[0];
				leafAtLocation.children[fullId] = lastDeletedTree[fullId];
				bufferMap[fullId.split("|")[1]] = fullId;
			} else if (fn in renames) {
				const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
					type: fn.at(-1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
					children: leafAtLocation.children[bufferMap[renames[fn]]].children,
				}
				if (leafAtLocation && fn) {
					leafAtLocation.children[bufferMap[renames[fn]].split("|")[0] + "|" + fn] = newTree;
				} else if (fn) {
					proposedDirectoryState[bufferMap[renames[fn]].split("|")[0] + "|" + fn] = newTree;
				}
			} else {
				const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
					type: fn.at(-1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
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
			const toDeleteTree: DirectoryTree = {
				[toDelete[fn]]: {
					...leafAtLocation.children[toDelete[fn]]
				}
			}
			if (!Object.values(renames).includes(fn)) get().setLastDeleted([...get().lastDeleted ?? [], toDeleteTree]);
			delete leafAtLocation.children[toDelete[fn]];
			delete bufferMap[fn];
		}

		get().setEditingDirectory(true);
		get().setProposedDirectoryState(atRoot ? leafAtLocation.children : proposedDirectoryState);
		get().setSidebarBufferMap(bufferMap);
	},

	detectAllDirectoryChanges: (): DirectoryChanges => {
		get().dedupeProposedDirectory();
		const res: DirectoryChanges = {
			created: [],
			deleted: [],
			moved: [],
		}
		const oldState: DirectoryTree = get().directoryState;
		const newState: DirectoryTree = get().proposedDirectoryState;

		const oldLocationMap: {
			[uuid: string]: {
				location: string,
				name: string,
				isFile: boolean,
			},
		} = get().constructLocationMapHelper(oldState);
		const newLocationMap: {
			[uuid: string]: {
				location: string,
				name: string,
				isFile: boolean,
			},
		} = get().constructLocationMapHelper(newState);

		for (const uuid of Object.keys(oldLocationMap)) {
			if (uuid in newLocationMap) {
				if (newLocationMap[uuid].location !== oldLocationMap[uuid].location) {
					res.moved.push({
						oldLocation: oldLocationMap[uuid].location,
						newLocation: newLocationMap[uuid].location,
						uuid: uuid,
						name: newLocationMap[uuid].name,
						isFile: newLocationMap[uuid].isFile,
					});
				}
			} else {
				res.deleted.push({
					objectLocation: oldLocationMap[uuid].location,
					uuid: uuid,
				});
			}
		}

		for (const uuid of Object.keys(newLocationMap)) {
			if (!(uuid in oldLocationMap)) {
				res.created.push({
					objectLocation: newLocationMap[uuid].location,
					uuid: uuid,
					name: newLocationMap[uuid].name,
					isFile: newLocationMap[uuid].isFile,
				});
			}
		}

		return res;
	},

	constructLocationMapHelper: (treeRoot: DirectoryTree): {
		[uuid: string]: {
			location: string,
			name: string,
			isFile: boolean,
		},
	} => {
		const res: {
			[uuid: string]: {
				location: string,
				name: string,
				isFile: boolean,
			},
		} = {};
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
			const uuid: string = key.split("|")[0];
			res[uuid] = {
				name: key.split("|")[1],
				isFile: key.at(-1) === "/" ? false : true,
				location: locString
			};
			for (const childKey of Object.keys(tree![key].children)) {
				q.push({ [childKey]: tree![key].children[childKey] });
				location.push(locString);
			}
		}
		return res;
	},

	setDirectoryConfirmation: (open: boolean) => {
		set({ directoryConfirmation: open })
	},

	//OPTIM:This is a workaround, i think this could be simpler
	dedupeProposedDirectory: () => {
		const proposedDirectoryState: DirectoryTree = { ...get().proposedDirectoryState };
		let subTree: DirectoryTree = proposedDirectoryState;

		const q: DirectoryTree[] = [];

		for (const key of Object.keys(proposedDirectoryState)) {
			q.push({ [key]: proposedDirectoryState[key] });
		}

		while (q.length > 0) {
			subTree = q.shift()!;
			const uuidMap: { [key: string]: boolean } = {};

			for (const childKey of Object.keys(subTree[Object.keys(subTree)[0]].children)) {
				//NOTE:Check for duplicate uuids from incorrect renames
				const curId: string = childKey.split("|")[0];
				if (curId in uuidMap) {
					const newTree: { type: DirectoryObjectType, children: DirectoryTree } = {
						type: childKey.at(-1) === "/" ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
						children: {},
					}
					const newId: string = v4();
					const fn = childKey.split("|")[1];
					if (subTree && fn) {
						subTree[Object.keys(subTree)[0]].children[newId + "|" + fn] = newTree;
					} else if (fn) {
						proposedDirectoryState[newId + "|" + fn] = newTree;
					}
					delete subTree[Object.keys(subTree)[0]].children[childKey];
					q.push({ [newId + "|" + fn]: subTree[Object.keys(subTree)[0]].children[newId + "|" + fn] });
				} else {
					uuidMap[curId] = true;
					q.push({ [childKey]: subTree[Object.keys(subTree)[0]].children[childKey] });
				}
			}
		}
		get().setProposedDirectoryState(proposedDirectoryState);
	},

	openFileInBuffer: async (id?: string) => {
		const fromSearch = id ? true : false;
		const fileId: string = fromSearch ? id!.split("|")[0] : get().getOilLine().split("|")[0];
		const activePane: PaneNode = get().getPaneById(get().activePane);

		const vnObject: VnObject | null = await getVnObjectById(fileId);
		if (vnObject) {
			activePane[Object.keys(activePane)[0]].fileId = fromSearch ? vnObject.id + "|" + vnObject.name : get().getOilLine();
			activePane[Object.keys(activePane)[0]].buffer = vnObject.contents;
			activePane[Object.keys(activePane)[0]].public = vnObject.public;
			activePane[Object.keys(activePane)[0]].bufferVersion++;
			get().updatePane(activePane);
		}
	},

	getLocationById: (id: string): string | null => {
		let resLoc: string | null = null;
		if (id === "START_PAGE") return resLoc;
		const root: DirectoryTree = get().directoryState;
		const q: DirectoryTree[] = [];
		const location: string[] = [];

		q.push({ [Object.keys(root)[0]]: root[Object.keys(root)[0]] });
		location.push("");

		while (q.length > 0) {
			const tree: DirectoryTree | undefined = q.shift();
			const loc: string | undefined = location.shift();
			const key = Object.keys(tree!)[0]!;
			const locString: string = loc + key;
			const uuid: string = key.split("|")[0];
			if (uuid === id.split("|")[0]) {
				resLoc = loc ?? null;
				break;
			}

			for (const childKey of Object.keys(tree![key].children)) {
				q.push({ [childKey]: tree![key].children[childKey] });
				location.push(locString);
			}
		}
		return resLoc;
	},
});
