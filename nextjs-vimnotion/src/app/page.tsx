"use server"

import MarketingHome from "@/components/custom/marketing-home";
import VimNotion from "@/components/custom/vim-notion";
import { cookies } from 'next/headers'

export default async function Home() {
	const authed: string | undefined = (await cookies()).get("authed")?.value;

	console.log(authed);

	if (!authed) {
		return (
			<MarketingHome />
		);
	}

	return (
		<VimNotion />
	);
}
