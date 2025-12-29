export type SearchResults = {
	[filePath: string]: {
		id: string,
		regexMatches: RegExpMatchArray,
		content?: string,
	}
}

export enum SearchType {
	FILENAME = "FILENAME",
	GREP = "GREP",
}
