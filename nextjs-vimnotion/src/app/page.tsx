"use server"

import MarketingHome from "@/components/marketing-pages/marketing-home";
import VimNotion from "@/components/vim-notion";
import { cookies } from 'next/headers'

export default async function Home() {
	const authed: string | undefined = (await cookies()).get("authed")?.value;

	if (!authed) {
		return (
			<MarketingHome />
		);
	}

	return (
		<VimNotion />
	);
}
