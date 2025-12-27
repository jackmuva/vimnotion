import DocsNav from "@/components/docs/docs-nav"
import { MarketingHeader } from "@/components/marketing-pages/marketing-header"
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Documentation | VimNotion",
	description: "Learn how to use VimNotion's Vim editor, Markdown rendering, and powerful features for note-taking and document editing.",
	openGraph: {
		title: "Documentation | VimNotion",
		description: "Learn how to use VimNotion's Vim editor, Markdown rendering, and powerful features.",
		type: "website",
	},
};

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="font-robo-mono text-lg h-dvh w-dvw flex flex-col items-center">
			<MarketingHeader />
			<div className="flex flex-col pt-4 w-full max-w-[1100px] gap-4">
				<DocsNav />
				{children}
			</div>
		</div>
	)

}
