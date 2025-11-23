import { DirectoryTree } from "@/types/sidebar-types";
import { EditorState } from "../editor-store";
import { SearchResults } from "@/types/search-types";

export const createSearchSlice = (
	set: {
		(partial: EditorState | Partial<EditorState> | ((state: EditorState) => EditorState | Partial<EditorState>), replace?: false): void;
		(state: EditorState | ((state: EditorState) => EditorState), replace: true): void;
	},
	get: () => EditorState
) => ({
	filePaths: {},

	refreshFilePaths: () => {
		const pathRes: { [path: string]: string } = {};
		let directoryTree: DirectoryTree = get().directoryState;

		const q: DirectoryTree[] = [];
		const prefixPaths: string[] = [];

		for (const key of Object.keys(directoryTree)) {
			q.push({ [key]: directoryTree[key] });
			prefixPaths.push(key.split("|")[1]);
		}

		while (q.length > 0 && prefixPaths.length > 0) {
			directoryTree = q.shift()!;
			const prefix = prefixPaths.shift()!;

			for (const childKey of Object.keys(directoryTree[Object.keys(directoryTree)[0]].children)) {
				pathRes[prefix + childKey.split("|")[1]] = childKey;
				q.push({
					[childKey]: directoryTree[Object.keys(directoryTree)[0]].children[childKey]
				});
				prefixPaths.push(prefix + childKey.split("|")[1]);
			}
		}
		set({ filePaths: pathRes });
	},

	searchByFilename: (term: string): SearchResults => {
		const searchRes: SearchResults = {};
		const filePaths: { [path: string]: string } = get().filePaths;

		for (const fp of Object.keys(filePaths)) {
			const matches: null | RegExpMatchArray = fp.match(term);
			if (matches && fp.at(-1) !== "/") {
				searchRes[fp] = {
					id: filePaths[fp],
					regexMatches: matches
				}
			}
		}

		return searchRes;
	},
	searchByGrep: (pat: string): SearchResults => {
		const searchRes: SearchResults = {};

		return searchRes;
	},

	newImageUrl: "",

	setNewImageUrl: (url: string) => {
		set({ newImageUrl: url });
	},
});
