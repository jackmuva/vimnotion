export enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

export enum EditorType {
	VIM = "VIM",
	MARKDOWN = "MARKDOWN",
}

export enum ChildType {
	NONE = "NONE",
	FIRST = "FIRST",
	SECOND = "SECOND",
}

export enum Direction {
	NORTH = "north",
	SOUTH = "south",
	EAST = "east",
	WEST = "west",
}


export type PaneNeighbors = {
	north: string | null,
	south: string | null,
	east: string | null,
	west: string | null,
}


export type PaneNode = {
	[id: string]: {
		children: Array<string>,
		parent: string | null,
		state: SplitState,
		neighbors: PaneNeighbors,
		childType: ChildType,
		deleted: boolean,
		editorType: EditorType,
		buffer: string,
		fileId: string,
	}
}

export type TabMap = {
	[tabId: string]: {
		lastPane: string,
		root: string,
		numPanes: number,
		panes: Array<string>,
	}
}
