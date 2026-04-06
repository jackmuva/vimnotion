"use server";

import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "Why Write with Vim | VimNotion",
		description: "Vim keeps you in the flow and promotes mastery over your writing tools. Your word processor should feel good to use and something that gets you excited to work on it",
		openGraph: {
			title: "Why Write with Vim | VimNotion",
			description: "Vim keeps you in the flow and promotes mastery over your writing tools. Your word processor should feel good to use and something that gets you excited to work on it",
			type: "article",
		},
	};
	return metadata;
}

export default async function WhyVimPage() {
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
								Published: January 31, 2025
							</div>
						</div>
					</div>
				</div>
				<h1>
					Why Write with Vim
				</h1>
				<div>
					Vim is one of the oldest text editors still popular today. From the labs of Berkley when Bill Joy worked on Vi
					to Bram Moolenaar's Vi Improved (Vim), Vim is known for its speed and retro hacker aesthetics.
				</div>
				<div>
					While you may not be a programmer, <strong>that doesn't mean Vim isn't for you!</strong>&nbsp;
					Writing code or articles or notes or journals isn't so dissimilar. At the end of the
					day, it's about writing characters on a screen in a productive and enjoyable way.
				</div>
				<div>
					<strong>Productive and enjoyable.</strong>
				</div>
				<div>
					The first time you picked up a word processor in school, you probably opened up Microsoft Word.
					Word 2007 sure brings me back.
					Later on, you may have used Google Docs because it was familiar and free with a Google account.
					Word and Docs are probably productive enough. Enjoyable? Maybe.
				</div>
				<img src={"/word-2007.png"} />
				<div>
					Vim isn't for everyone. But at the same time, it's genuinely changed my life. I feel obligated to
					share my love for Vim and why I think Vim provides the best writing experience for writers who
					value speed, flow, and mastery of their tools.
				</div>
				<h2>
					Write at the Speed of Your Thoughts
				</h2>
				<div>
					Writing isn't always a linear process. Sometimes you just write down your page. And sometimes
					you need to jump a few paragraphs up as you revise your draft. You may need to jump to the
					beginning of a paragraph to beef up your first sentence or jump a few words back as you
					thought of a better word choice.
				</div>
				<div>
					Each of these small actions may cause you to use your mouse and interrupt your thought process and typing rhythm.
					<strong>Vim is purely keyboard-based</strong>. It's like having keyboard shortcuts for every useful writing action.
				</div>
				<ul>
					<li>Need to delete a word? &nbsp;<code>dw</code>&nbsp;(delete word)</li>
					<li>Need to go to the next occurence of the letter "p"? &nbsp;<code>fp</code>&nbsp;(find p)</li>
					<li>Need to jump 5 words forward? &nbsp;<code>5w</code>&nbsp;(5 words)</li>
				</ul>
				<div>
					It's not as much memorization as you'd think. <strong>These Vim Motions become muscle memory</strong>.
					Before long, you'll want these Vim Motions everywhere (That's what prompted me to build
					VimNotion. I literally wanted Vim Motions in Notion, my day-to-day word processor).
				</div>
				<h2>
					Rhythm and Flow
				</h2>
				<blockquote> Be Quick But Don't Hurry</blockquote>
				<div>
					Speed may make you more productive, but remember: <strong>your word processor should make writing productive and enjoyable</strong>.
					Keeping your fingers moving. Getting in a rhythm. It builds a hypnotic clack-clack-clack.
					You're in a flow. You're fully present and engaged.
				</div>
				<div>
					It's not about going as fast as possible. Vim's speed is just a tool to keep your fingers moving
					and perform common writing actions as soon as you want.
				</div>
				<div>
					Typing isn't like writing on pen and paper.
					It's like playing the piano. You use your fingers. You hear the sounds of the keyboard. You type in a
					cadence that changes as you write. But the longer you can stay in a consistent cadence, the
					better your flow will be.
				</div>
				<img src={"/piano.png"} />
				<h2>
					If Writing is an Art, Then Your Word Processor is Your Paintbrush
				</h2>
				<div>
					Microsoft Word and Google Docs are the default <em>writing paintbrushes</em>. How many hours per week, per month, per year do you
					spend writing on your computer?
				</div>
				<div>
					It can be scary and jarring to move away from a word processor you grew up using, but it can also be refreshing.
					My first foray outside of Word/Docs was Notion. Notion's clean aethetic and simplicity was a breath of fresh air.
				</div>
				<img src={"/notion.png"} />
				<div>
					But as I power-used Notion, spending hours every week on it, I was missing something. Yes, I missed the speed of
					Vim Motions, but more than that, I missed the muscle memory and feeling of mastery I had over my text editing.
				</div>
				<div>
					That mastery of your paintbrush is what's missing in a lot of our tools. For tools we use everyday, we should
					feel satisfaction from building our skill-level with that tool. Vim Motions, comboing <code>:vs{"<space>"}m</code>&nbsp;
					to split my screen vertically and render my article into a nice looking markdown without breaking my
					stride is muscle memory that I've built over months and years.
				</div>
				<img src={"/speed-of-thoughts.gif"} />
				<div>
					These Vim Motion skills pay dividends as
					I waste less time moving my mouse to click on a small button, navigate cluttered menus, and spend
					more time if flow.
				</div>

				<div className="my-8 place-self-center w-5/6 border-b" />
				<div>
					I know it may come off as "crazy control-freak" behavior to care about mouse clicks and key combos to this level.
					Vim isn't for everybody. But like I said, Vim is a tool I enjoy using <strong>everyday</strong>. So yes,
					like a missionary, my attempts at evangelism may fall on many deaf ears.
				</div>
				<div>
					But I didn't spend hours and hours and hours of my life building a website dedicated to writing
					in Vim if I didn't love it and if I didn't think at least a few other people may enjoy it. So with that,
					I'll leave you with this quote:
				</div>
				<blockquote> We can do no great things. Only small things with great love.</blockquote>
				<div>
					VimNotion is my loveletter to Vim. May other Vim enthusiasts and adventurers brave enough to
					enter the arena, read it.
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>:wq,</div>
					<div>- Jack</div>
				</div>
			</div>
		</div>
	);
}
