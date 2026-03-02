export type VnObject = {
	id: string,
	name: string,
	isFile: boolean,
	contents: string,
	updateDate: string,
	public: boolean,
	email?: string,
}

export type Suggestion = {
	id: string,
	vnObjectId: string,
	email: string,
	startLine: number,
	endLine: number,
	oldString: string,
	newString: string,
	explanation: string,
	deleted?: boolean,
}
