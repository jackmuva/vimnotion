import { AiMessage } from "@/types/ai-types";
import { Suggestion, VnObject } from "@/types/primitive-types";
import { DirectoryChanges, DirectoryTree } from "@/types/sidebar-types";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export type VnObjectResponse = {
	Data: VnObject[];
	Suggestions: Suggestion[];
};

export const getAsciiStream = async (content: string): Promise<Response> => {
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ai/ascii`,
		{
			method: "POST",
			body: JSON.stringify({
				role: "user",
				content: content,
				type: "message",
			}),
			credentials: "include"
		});
	return res;
}

export const getAgentStream = async (messages: Array<AiMessage>, sessionId: string): Promise<Response> => {
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ai/agent`,
		{
			method: "POST",
			body: JSON.stringify({
				messages: messages,
				sessionId: sessionId,
			}),
			credentials: "include"
		});
	return res;
}
export const updateDirectoryStructure = async (changes: DirectoryChanges, structure: DirectoryTree): Promise<boolean> => {
	const res: Response = await fetch(`${BACKEND_BASE_URL}/api/directory`, {
		method: "PUT",
		headers: {
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			changes: changes,
			structure: JSON.stringify(structure)
		}),
		credentials: "include",
	});
	return res.ok;
}

export async function getDirectory(): Promise<any> {
	try {
		const req = await fetch(`${BACKEND_BASE_URL}/api/directory`,
			{
				credentials: 'include'
			});
		return await req.json();
	} catch (err) {
		console.error("Unable to get directory: ", err);
		return null;
	}
}

export async function getVnObjectById(fileId: string, isPublic: boolean = false): Promise<{ file: VnObject | null, suggestions: Suggestion[] } | null> {
	try {
		const res = await fetch(`${BACKEND_BASE_URL}/api/vnobject/${isPublic ? "public/" : ""}${fileId}`, {
			credentials: !isPublic ? "include" : undefined
		});
		if (!res.ok) {
			console.error("Failed to fetch vnobject:", res.status);
			return null;
		}
		const body: VnObjectResponse = await res.json();
		console.log('vn object data: ', body);
		return {
			file: body.Data[0] ?? null,
			suggestions: body.Suggestions
		};
	} catch (err) {
		console.error("Unable to get vnobject:", err);
		return null;
	}
}

export async function updateVnObject(vnObject: VnObject): Promise<boolean> {
	try {
		const res = await fetch(`${BACKEND_BASE_URL}/api/vnobject`, {
			method: "PUT",
			body: JSON.stringify(vnObject),
			credentials: "include",
		});
		return res.ok;
	} catch (err) {
		console.error("Unable to update vnobject:", err);
		return false;
	}
}

export async function grepVnObjects(pattern: string): Promise<VnObject[]> {
	try {
		const res = await fetch(`${BACKEND_BASE_URL}/api/vnobject/grep?q=${pattern}`, {
			credentials: "include",
		});
		if (!res.ok) {
			console.error("Failed to grep vnobjects:", res.status);
			return [];
		}
		const body: VnObjectResponse = await res.json();
		return body.Data;
	} catch (err) {
		console.error("Unable to grep vnobjects:", err);
		return [];
	}
}

export async function deleteSuggestionById(suggestionId: string): Promise<void> {
	try {
		const res = await fetch(`${BACKEND_BASE_URL}/api/suggestion/${suggestionId}`, {
			credentials: "include",
		});
		if (!res.ok) {
			console.error("Failed to delete suggestion: ", res.status);
		}
	} catch (err) {
		console.error("Unable to delete suggestion: ", err);
		return;
	}
}
