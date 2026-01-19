import { VnObject } from "@/types/primitive-types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export type VnObjectResponse = {
	Data: VnObject[];
};

export async function getVnObjectById(fileId: string): Promise<VnObject | null> {
	try {
		const res = await fetch(`${BASE_URL}/api/vnobject/${fileId}`, {
			credentials: "include",
		});
		if (!res.ok) {
			console.error("Failed to fetch vnobject:", res.status);
			return null;
		}
		const body: VnObjectResponse = await res.json();
		return body.Data[0] ?? null;
	} catch (err) {
		console.error("Unable to get vnobject:", err);
		return null;
	}
}

export async function updateVnObject(vnObject: VnObject): Promise<boolean> {
	try {
		const res = await fetch(`${BASE_URL}/api/vnobject`, {
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
		const res = await fetch(`${BASE_URL}/api/vnobject/grep?q=${pattern}`, {
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
