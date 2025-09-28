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
