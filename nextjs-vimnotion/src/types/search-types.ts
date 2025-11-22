export type SearchResults = {
	[filePath: string]: {
		id: string,
		regexMatches: RegExpMatchArray
	}
}
