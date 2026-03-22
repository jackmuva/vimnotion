import { DirectoryTree } from "@/types/sidebar-types";
import { SearchResults } from "@/types/search-types";
import { grepVnObjects } from "@/services/api-service";
import { StoreSetter, StoreGetter } from "../../types/store-types";

export const createSearchSlice = (
	set: StoreSetter,
	get: StoreGetter
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
			const matches: null | RegExpMatchArray = fp.match(term.split("").map((letter) => letter + ".*").join(""));
			if (matches && fp.at(-1) !== "/") {
				searchRes[fp] = {
					id: filePaths[fp],
					regexMatches: matches
				}
			}
		}

		return searchRes;
	},

	searchByGrep: async (pat: string): Promise<SearchResults> => {
		const searchRes: SearchResults = {};
		const vnObjects = await grepVnObjects(pat);

		for (const vnObject of vnObjects) {
			const matches: null | RegExpMatchArray = vnObject.contents.match(pat);
			if (matches) {
				searchRes[vnObject.name] = {
					id: vnObject.id,
					regexMatches: matches,
					content: vnObject.contents
				}
			}
		}
		return searchRes;
	},

	newImageUrl: "",
	setNewImageUrl: (url: string) => {
		set({ newImageUrl: url });
	},

	newAiBlock: "",
	setNewAiBlock: (aiRes: string) => {
		set({ newAiBlock: aiRes });
	},
});
