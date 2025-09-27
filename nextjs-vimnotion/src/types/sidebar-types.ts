export type SidebarData = {
	StatusCode: number;
	Message?: string;
	Data?: string;
}

export enum DirectoryObjectType {
	FILE = "FILE",
	DIRECTORY = "DIRECTORY",
}

export type DirectoryObject = {
	type: DirectoryObjectType;
	children: DirectoryTree;
}

export type DirectoryTree = {
	[objectId: string]: DirectoryObject;
}
