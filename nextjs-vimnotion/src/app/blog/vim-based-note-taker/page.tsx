"use server";

import Link from "next/link";

export default async function VimBasedNotesPage() {
	return (
		<div className="h-dvh w-dvw px-2 flex flex-col items-center overflow-y-auto pt-4">
			<div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 pb-20">
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
								Published: December 15, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</div>
				</div>
				<h1>
					Search for a Vim-based Note Taker
				</h1>
				<div>
					If you&apos;re like me, you spend all too much time in Neovim.
					Vim motions are muscle memory. It&apos;s basically part of my identity.
				</div>
				<div>
					<pre>
						diw<br />
						2fa<br />
						:%s/old/new/gc<br />
						I<br />
					</pre>
				</div>
				<div>
					It makes sense that these vim motions seep their way into all my text editing
					work. Thus starts my quest to find a <strong>Vim-based note taker</strong>.
				</div>
				<h2>
					Neovim
				</h2>
				<div>
					Neovim is the natural first stop to taking notes with a vim editor.
					I already write READMEs on Neovim, why not use it for Markdown-based notes?
					I&apos;ve even seen a few plugins to make Neovim notes cloud available.
				</div>
				<div>
					But the strengths of a terminal app are also its weaknesses. Terminal apps have limitations
					like <strong>one font size</strong> and <strong>text-based interfaces</strong> that enhance simplicity and creativity (Neovim and Opencode are some of my most loved apps).
				</div>
				<img src={"/neovim-editor.png"} />
				<div>
					These limitations are also not ideal for the type of notes app that I wanted.
					A notes app with:
				</div>
				<ul className="list-disc list-inside">
					<li>Different sized fonts</li>
					<li>Support for images</li>
				</ul>
				<div>
					I want my notes and documents to be aesthetic and easily shareable with non-technical folks,
					so a terminal app was out of the question for my notes.
				</div>
				<h2>
					Obsidian
				</h2>
				<div>
					Obsidian is a beloved notes and knowledge app. I love Obsidian&apos;s local-first philosophy
					and it did support vim! That being said, Obsidian in my opinion is a local desktop
					notes app built for general audiences first, and not built for vim users first.
				</div>
				<div>
					Obsidian had the vim motions, but didn&apos;t feel as smooth and flow-inducing as programming
					on Neovim.
				</div>
				<ol className="list-decimal list-inside flex flex-col gap-4">
					<li>
						<strong>Not mono-spaced</strong>: Every character in vim in your terminal takes up the same
						amount of space. The even spacing makes it easy to navigate up and down your file.
						In Obsidian, Markdown notes have different sized fonts, so navigating lines feels
						choppy while the cursor changes sizes.
					</li>
					<li>
						<strong>Keyboard shortcuts felt unnatural</strong>: I&apos;m sure I could&apos;ve overcome this,
						but something in my Neovim brain didn&apos;t click with Obsidian&apos;s native shortcuts.
						<code className="bg-foreground/10 px-1 rounded">&lt;Command&gt;+K</code> never hit as a good as <code className="bg-foreground/10 px-1 rounded">&lt;Space&gt;sf</code>.
					</li>
					<li>
						<strong>Not Vim-first</strong>: Obsidian was built for everyone, not with vim users first.
						Because of that, navigation takes multiple clicks on menus and sidebars.
					</li>
				</ol>
				<img src={"/obsidian.png"} />
				<div>
					I realized that there&apos;s a difference between <strong>a notes app with vim bindings</strong> and a
					truly <strong>Vim-first notes app</strong>. I wanted the latter. I wanted my fingers to fly.
				</div>
				<h2>
					Org Mode with Vim
				</h2>
				<div>
					I&apos;ll be honest here, I skipped this stop. I know some people swear by this,
					but I didn&apos;t want (or maybe I&apos;m not ready) to use emacs. Sorry everyone.
				</div>
				<h2>
					Inkdrop
				</h2>
				<div>
					Inkdrop is an app for technical notes by Takuya Matsuyama. It&apos;s hard for me
					to nitpick Inkdrop because Matsuyama is an inspiration to me. His work and story
					regularly inspire me and sets a standard for just what a solo dev can do.
				</div>
				<div>
					Inkdrop is incredible with <strong>first-class Markdown</strong>, key bindings for vim, emacs and
					even sublime. Inkdrop has local and cloud syncs, monospace text editing and built-in
					markdown renderer, and even a Telescope-like search command Matsuyama even
					named &quot;Telescope&quot; in homage to TJ Devries&apos;s Neovim plugin.
				</div>
				<img src={"/inkdrop.jpeg"} />
				<div>
					Inkdrop is the closest note taker to what I wanted:
				</div>
				<blockquote className="border-l-4 border-foreground/30 pl-4 italic">
					A Neovim-like experience for beautiful notes
				</blockquote>
				<div>
					But it still didn&apos;t carry the <strong>Vim-first ethos</strong> I sought.
				</div>
				<div>
					We all have different reasons we came to and stayed for vim. For me, it was <strong>not
						the extensibility or customizability</strong>. My passion isn&apos;t to find the optimal
					configuration for my workflow, it&apos;s to find tools that I love working with.
				</div>
				<div>
					Extensibility &amp; customizability can be a part of that equation, of course.
					But I&apos;ve come to find that <code className="bg-foreground/10 px-1 rounded">kickstart.nvim</code> defaults with <code className="bg-foreground/10 px-1 rounded">oil.nvim</code>
					are all that I need for my Neovim setup.
				</div>
				<div>
					And so, the extensibility and plugin ecosystem of Inkdrop didn&apos;t speak to me
					as it may speak to some of you.
				</div>
				<div>
					I believe I could have tweaked Inkdrop to make it work for me.
					But instead, like any hacker with too much time, I asked the time-honored question:
				</div>
				<blockquote className="border-l-4 border-foreground/30 pl-4 italic">
					What if I built my own tool?
				</blockquote>
				<h2>
					Enter VimNotion
				</h2>
				<div>
					VimNotion is a notes &amp; document text editor that holds <strong>Vim and Markdown
						as first-class citizens above all else</strong>.
				</div>
				<div>
					VimNotion is monospaced, with consistent font, font sizes, and line numbers.
					Your fat cursor in normal mode can fly across your doc. It&apos;s almost like you&apos;re working in Neovim in your terminal.
				</div>
				<img src={"/vimnotion-md.png"} />
				<div>
					What you can&apos;t do in your terminal - what you can&apos;t do in Neovim or vim - is render
					Markdown in HTML with images.
					VimNotion, built on the web, can render your Markdown notes with a quick key
					combination <code className="bg-foreground/10 px-1 rounded">&lt;Space&gt;m</code>. &quot;Space&quot; being the leader key, and [m]arkdown.
				</div>
				<img src={"/vimnotion-rendered.png"} />
				<div>
					VimNotion adopted a subset of Vim commands for notes -
					<code className="bg-foreground/10 px-1 rounded">:split</code>,
					<code className="bg-foreground/10 px-1 rounded">:vsplit</code>, and
					<code className="bg-foreground/10 px-1 rounded">:tabnew</code>.
					VimNotion also adopted some keybindings and extensions inspired from Telescope.nvim
					and oil.nvim, using {`<Space>`} as the leader key.
				</div>
				<h2>
					End of the Journey?
				</h2>
				<div>
					I&apos;ve searched far and wide for the perfect Vim-based note taker. In that search,
					I&apos;ve built my own <strong>vim-first</strong> note taker, VimNotion. It&apos;s some of the most
					fun I&apos;ve had programming. If you&apos;re a vim enthusiast, I hope you&apos;ll give it
					a try and let me know your thoughts. Until next time.
				</div>
				<div className="flex flex-col w-full gap-1">
					<div>:wq,</div>
					<div>- Jack</div>
				</div>
			</div>
		</div>
	);
}
