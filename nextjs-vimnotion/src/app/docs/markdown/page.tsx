"use server";

import { MarketingHeader } from "@/components/custom/marketing-pages/marketing-header";

export default async function MarkdownDocsPage() {
	return (
		<div className="w-full">
			<div id="md-editor-docs" className="flex flex-col w-full max-w-[1100px] gap-4 overflow-y-auto pb-20 px-4">
				<h1>Markdown Docs</h1>
				<h2>What is Markdown?</h2>
				<div>
					Markdown was created by John Gruber in 2004 with strong influence from Aaron Schwartz.
					Markdown goal? To be a lightweight markup language that was <strong>easily readable</strong> AND <strong>easily
						converted to HTML</strong>!
				</div>
				<h2>
					Why VimNotion is Built on Markdown
				</h2>
				<div>
					There are many popular text editors/note takers like Notion, Obsidian, and Inkdrop
					that embarace Markdown format! Rather than click buttons on navbars or right click
					for menu options, ***you can create headers, bullets, links or bold, italic, underline
					text*** directly in your text with Markdown syntax.
				</div>
				<div>
					VimNotion is all about flow, so keeping your hands on your keyboard with the ability to
					move at the speed of your thoughts is what it's all about.
				</div>
			</div>
		</div>
	);
}
