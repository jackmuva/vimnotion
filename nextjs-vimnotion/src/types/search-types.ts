export type SearchResults = {
	[filePath: string]: {
		id: string,
		regexMatches: RegExpMatchArray
	}
}

export enum SearchType {
	FILENAME = "FILENAME",
	GREP = "GREP",
}
