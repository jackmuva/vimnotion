export type SidebarData = {
	StatusCode: number;
	Message?: string;
	Data?: string;
}

export enum DirectoryObjectType {
	FILE = "FILE",
	DIRECTORY = "DIRECTORY",
}

export type DirectoryTree = {
	[objectId: string]: {
		type: DirectoryObjectType;
		children: DirectoryTree;
	}
}

export type DirectoryChanges = {
	created: {
		objectLocation: string,
		uuid: string,
		name: string,
		isFile: boolean,
	}[],
	deleted: {
		objectLocation: string
		uuid: string,
	}[],
	moved: {
		oldLocation: string,
		newLocation: string,
		uuid: string,
		name: string,
		isFile: boolean,
		contents?: string,
	}[],
}
