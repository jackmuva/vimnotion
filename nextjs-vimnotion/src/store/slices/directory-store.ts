import { DirectoryChanges, DirectoryObjectType, DirectoryTree } from "@/types/sidebar-types";
import { EditorState } from "../editor-store";
import { v4 } from "uuid";
import { PaneNode } from "@/types/editor-types";
import { VnObject } from "@/types/primitive-types";

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
	setSidebarBufferMap: (bufferMap: { [id: string]: string }) => set({ sidebarBufferMap: bufferMap }),

	setLastDeleted: (delTree: DirectoryTree) => {
		set({ lastDeleted: delTree })
	},

	evaluateOilBufferChanges: () => {
		const proposedDirectoryState: DirectoryTree = { ...get().proposedDirectoryState };
		const bufferMap: { [id: string]: string } = { ...get().sidebarBufferMap };

		//create a map with only new/changes and a map with stale lines
		const newLines: { [lineNum: number]: string } = {};
		const staleLines: { [lineNum: number]: string } = {};
		if (newBuffer && oldBuffer) {
			const newBufferLines: string[] = newBuffer.split("\n");
			const oldBufferLines: string[] = oldBuffer.split("\n");
			for (let i = 0; i < newBufferLines.length; i++) {
				if (!oldBufferLines.includes(newBufferLines[i])) {
					newLines[i] = newBufferLines[i]
				}
			}
			for (let i = 0; i < oldBufferLines.length; i++) {
				if (!newBufferLines.includes(oldBufferLines[i])) {
					staleLines[i] = oldBufferLines[i]
				}
			}
		}

		console.log("new lines: ", newLines);
		console.log("old only lines: ", staleLines);

		get().setEditingDirectory(true);
		get().setProposedDirectoryState(proposedDirectoryState);
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
		if (!open) {
			get().setLocation(get().lastValidLocation);
		}
		get().evaluateOilBufferChanges();
		set({ directoryConfirmation: open })
	},

	openFileInBuffer: (id?: string) => {
		const fileId: string = id ? id.split("|")[0] : get().getOilLine().split("|")[0];
		const activePane: PaneNode = get().getPaneById(get().activePane);

		fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/vnobject/${fileId}`,
			{
				credentials: 'include'
			}
		).then((res: Response) => {
			res.json().then((body: { Data: VnObject }) => {
				activePane[Object.keys(activePane)[0]].fileId = id ? id.split("|")[0] : get().getOilLine();
				activePane[Object.keys(activePane)[0]].buffer = body.Data.contents;
				activePane[Object.keys(activePane)[0]].public = body.Data.public;
				get().updatePane(activePane);
			}).catch((err) => {
				console.error("unable to get vnobject: ", err);
			});
		}).catch((err) => {
			console.error("unable to get vnobject: ", err);
		});
	}
});
