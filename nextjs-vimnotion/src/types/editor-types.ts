export enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

export enum ChildType {
	NONE = "NONE",
	FIRST = "FIRST",
	SECOND = "SECOND",
}

export enum Direction {
	NORTH = "NORTH",
	SOUTH = "SOUTH",
	EAST = "EAST",
	WEST = "WEST",
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
	}
}


