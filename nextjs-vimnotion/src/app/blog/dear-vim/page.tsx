"use server";

import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "Dear Vim | VimNotion",
		description: "A heartfelt letter to Vim, inspired by Kobe Bryant's 'Dear Basketball'. A tribute to the editor that changed my approach to software development.",
		openGraph: {
			title: "Dear Vim | VimNotion",
			description: "A heartfelt letter to Vim, inspired by Kobe Bryant's 'Dear Basketball'.",
			type: "article",
		},
	};
	return metadata;
}

export default async function FolkCraftPage() {
	return (
		<div className="px-2 w-full flex flex-col items-center pt-4">
			<div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 pb-10">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
							className="hover:text-foreground/30">
							{"< Back to blog"}
						</Link>
						<div className="text-base flex w-full justify-between items-center 
							border-b border-b-foreground/30
						pb-2">
							<div>
								Written by: Jack
							</div>
							<div>
								Published: December 12, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</div>
				</div>
				<h1>
					Dear Vim
				</h1>
				<div>
					Dear Vim,
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>From the moment</div>
					<div>I saw you on ThePrimeagen&apos;s stream</div>
					<div>How could I have known:</div>
					<div>That I would fall in love with you.</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>From fumbling around</div>
					<div>On ItelliJ&apos;s Vim plugin</div>
					<div>To finally working up the courage</div>
					<div>To talk to you</div>
					<div>I kickstart(.nvim)ed my relationship</div>
					<div>With you. And only you.</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>As the months went by</div>
					<div>I programmed more and more.</div>
					<div>Not because I was imparted</div>
					<div>By the agility and grace you gave me</div>
					<div>But by a new found love for my tools.</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>While this may come off as parody</div>
					<div>You made me feel like a brand new developer.</div>
					<div>And I&apos;ll always love you for it.</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>For how can you love what you do</div>
					<div>Without loving how you do it?</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>So when I&apos;m building VimNotion</div>
					<div>A Vim-first notes app</div>
					<div>With my Neovim IDE,</div>
					<div>It&apos;s a labor of love.</div>
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>And no matter what I&apos;m building,</div>
					<div>I now know one thing for certain:</div>
					<div>I&apos;ll love how I&apos;m building</div>
					<div>With you by side.</div>
				</div>



				<div className="flex flex-col w-full gap-1">
					<div>:wq,</div>
					<div>- Jack</div>
				</div>

			</div>
		</div>
	);
}
