"use server"

import MarketingHome from "@/components/marketing-pages/marketing-home";
import VimNotion from "@/components/vim-notion";
import { cookies } from 'next/headers'
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "VimNotion - Vim-First Notes & Document Editor",
		description: "A Vim-first notes and document editor built for developers. Write with Vim motions, render beautiful Markdown, and organize your thoughts with ease.",
		openGraph: {
			title: "VimNotion - Vim-First Notes & Document Editor",
			description: "A Vim-first notes and document editor built for developers.",
			type: "website",
		},
	};
	return metadata;
}

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
