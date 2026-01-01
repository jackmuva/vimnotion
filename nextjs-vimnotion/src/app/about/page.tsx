"use server";

import { TwitterIcon } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "About VimNotion",
		description: "VimNotion is a writing app built with first class vim and markdown support. VimNotion pays homage to Vim and Notion.",
		openGraph: {
			title: "About VimNotion",
			description: "VimNotion is a writing app built with first class vim and markdown support. VimNotion pays homage to Vim and Notion.",
			type: "article",
		},
	};
	return metadata;
}

export default async function AboutPage() {
	return (
		<div className="h-dvh w-full flex flex-col items-center">
			<div id="md-editor-about" className="flex flex-col w-full max-w-[1100px] gap-4">
				<h2>
					Have you ever wanted Notion with&nbsp;<strong>vim motions</strong>?
				</h2>
				<div>
					VimNotion is an ode to vim, bringing vim functionality to
					a Notion-like notes and document editor.
				</div>
				<div>
					Spending so much time on vim and Neovim everyday, I wanted
					the same buttery smoothness of vim on our notes and document app.
					For me, that was Notion.
				</div>
				<div>
					(Read about other products I've tried: <a href="/blog/vim-based-note-taker" target="_blank">Search for a Vim-Based Note Taker</a>)
				</div>
				<div>
					And so, I wanted to build a notes app that felt like vim, carried
					the speed of vim, the utility of plugins like Telescope and Oil, and the commands
					for code and notes. Commands like <code>:vsplit</code> and <code>:tabnew</code>.
				</div>
				<img src={"/split-ss.png"} />
				<div>
					I hope you give VimNotion a try! And reach out to me with any
					feedback and ideas!
				</div>
				<div>
					-Jack
				</div>
				<div className="flex flex-col ">
					<pre>
						email: jackmu@umich.edu
					</pre>
					<pre className="flex gap-1 items-center">
						<TwitterIcon size={20} />
						<div>
							/ X:
						</div>
						<a href="https://x.com/jackmuva" target="_blank">
							@jackmuva
						</a>
					</pre>
				</div>
			</div>
		</div>
	);
}
