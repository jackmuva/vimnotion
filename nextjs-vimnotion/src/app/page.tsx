"use server"

import VimNotion from "@/components/custom/vim-notion";

export default async function Home() {
	const isVerified = async (): Promise<boolean> => {
		const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/directory`,
			{
				credentials: 'include'
			});
		console.log(res);
		if (res.ok) {
			const body = await res.json();
			if (body.StatusCode === 200) return true;
		}
		return false;
	}

	const authed = await isVerified();
	console.log("authed: ", authed);

	return (
		<VimNotion />
	);
}
