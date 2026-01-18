"use server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "Vim Guide | VimNotion",
		description: "Get started with Vim in VimNotion. Learn essential keybindings, navigation, editing, and Vim philosophy.",
		openGraph: {
			title: "Vim Guide | VimNotion",
			description: "Get started with Vim in VimNotion. Learn essential keybindings and navigation.",
			type: "article",
		},
	};
	return metadata;
}

export default async function VimDocsPage() {
	return (
		<div className="w-full">
			<div id="md-editor-docs" className="flex flex-col w-full max-w-[1100px] gap-4 overflow-y-auto pb-20 px-4">
				<h1>How to get started with the <em>Vim</em> of VimNotion</h1>

				<h2>What is Vim?</h2>
				<div>
					Vim is actually just a text editor (like Microsoft Word)! Vim has a rich history that
					starts with text editors like ed, em, and vi written in the 1970s. Bram Moolenaar wrote
					<em>Vim</em> (Vi Improved) from a vi clone and is now one of the most popular text editors, especially
					for programmers that work on servers.
				</div>
				<div>
					Vim is pre-packaged in most Unix based systems. In fact, if you open your terminal and type in &quot;vim&quot; I
					would bet your marchine already has vim installed.
				</div>

				<hr />

				<h2>Why is Vim such a core piece of VimNotion?</h2>
				<div>
					Besides its namesake, VimNotion embraces Vim not because of its complicated commands and key combinations,
					but because <strong>Vim&apos;s ergonomics keep you in the flow of writing once those keybindings are muscle memory.</strong>
				</div>
				<div>
					I&apos;ve found that once I&apos;ve gotten familiar with Vim and its keybindings, I&apos;m able to type and edit notes,
					code, documentation, any type of text closer to the speed of my thoughts. I can navigate lines, change text,
					and find things extemely quickly without context switching to my mouse and instead just keep my fingers flying.
				</div>
				<div>
					<strong><em>Vim is a tool I just love using. When you love your tools, it&apos;s really easier to love your work.</em></strong>
				</div>

				<hr />

				<h2>Some Vim basics</h2>
				<div>
					This guide isn&apos;t a comprehensive tutorial to all of the different Vim keybindings. It&apos;s more to help you
					get started.
				</div>
				<hr />
				<div>
					NOTE: I actually encourage you to go into VimNotion and use the command
					<pre>:vimtutor</pre>
					for an interactive tutorial of Vim.
				</div>
				<hr />
				<h3>Navigating the cursor with Vim</h3>
				<div>
					In general, try to only use the keyboard when working with Vim.
				</div>
				<div>
					To move your cursor, use:
					<ul>
						<li>h - to go left</li>
						<li>j - to go down</li>
						<li>h - to go up</li>
						<li>l - to go right</li>
					</ul>
				</div>
				<hr />
				<h3>Adding text</h3>
				<div>
					Using h, j, k, and l to put your cursor in the right spot, when you&apos;re ready to add some text, use:
					<ul>
						<li>i - to insert the cursor on the left of the fat cursor</li>
						<li>a - to insert the cursor on the right</li>
					</ul>
				</div>
				<div>
					You can exit &quot;insert mode&quot; and go back into &quot;normal mode&quot; by pressing &quot;&lt;ESC&gt;&quot;
				</div>
				<hr />
				<h3>Deleting text</h3>
				<div>
					&quot;x&quot; is how you delete a character. You can use a number followed by &quot;x&quot; to delete multiple characters.
					For example, &quot;5x&quot; deletes 5 characters.
				</div>
				<div>
					&quot;d&quot; is another way to delete, but &quot;d&quot; is a modifier that requires an additional motion.
				</div>
				<div>
					Common delete commands:
				</div>
				<ul>
					<li>dw - deletes word</li>
					<li>dd - deletes the line</li>
					<li>diw - deletes in word if your cursor is in the middle of the word</li>
					<li>2dw - deletes two words</li>
				</ul>

				<hr />

				<h3>Copying and pasting</h3>
				<div>
					Use &quot;y&quot; to yank (copy) text, and then &quot;p&quot; to paste. You can use a count and a motion with &quot;y&quot; and &quot;p&quot;.
					For example, &quot;2yw&quot; yanks two words, and &quot;p&quot; pastes them after the cursor.
				</div>
				<div>
					To cut and paste, instead of using &quot;y&quot; just use &quot;d&quot;. The deleted text is saved and can be pasted with &quot;p&quot;.
				</div>

				<hr />

				<h3>Navigating a document</h3>
				<div>
					You can use &quot;j&quot; and &quot;k&quot; to move up and down a document, and even use a count and motion like &quot;10j&quot; to move quicker.
				</div>
				<div>
					Here are some other useful vertical navigation keybindings:
				</div>
				<ul>
					<li>gg to go to the top of the doc</li>
					<li>G to go to the bottom</li>
					<li>&lt;ctrl&gt;d to move halfway down your screen</li>
					<li>&lt;ctrl&gt;u to move halfway up your screen</li>
					<li>&#123; to move up to the next blank line</li>
					<li>&#125; to move down to the next blank line</li>
				</ul>
				<div>
					You should also use the &quot;/&quot; followed by a search keyterm to search for a word in your document.
					After pressing &lt;enter&gt; you can press &quot;n&quot; to move to the next occurance and &quot;N&quot; to move to the previous one.
				</div>

				<hr />

				<h3>Additional line navigation</h3>
				<div>
					If you have a long line, &quot;h&quot; and &quot;l&quot; may not be the best way to move within a line.
				</div>
				<ul>
					<li>_ - go to the beginning of the line</li>
					<li>$ - go to the end of the line</li>
					<li>w - go to the beginning of the next word</li>
					<li>e - go to the end of the next word</li>
					<li>b - go to the beginning of the <strong>previous</strong> word</li>
				</ul>
				<div>
					One of the most useful motions is &quot;f&quot; and &quot;F&quot;. &quot;f&quot; followed by a character will jump to the next occurrence of that
					character. &quot;F&quot; works the same way but jumps to the previous occurrence of that character in the line.
					Use &quot;;&quot; to jump to the next occurrence without typing the motion again.
				</div>

				<hr />

				<h3>View mode</h3>
				<div>
					We went over how &quot;i&quot; and &quot;a&quot; will put you in insert mode, and &quot;&lt;ESC&gt;&quot; will put you back in normal mode.
					The other useful mode is view mode with &quot;v&quot;
				</div>
				<div>
					In view mode you can highlight text, move around with &quot;w&quot; or &quot;b&quot; or &quot;f&quot; or &quot;h&quot; before yanking or deleting.
				</div>
				<hr />
				<h3>Commands</h3>
				<div>
					While not directly a part of Vim motions, commands are how VimNotion, Vim, and other extensions
					execute an action like quitting, saving a file, and creating tabs. The most important ones in VimNotion
					are inspired from Vim.
				</div>
				<ul>
					<li>&quot;:q&quot; to quit a document <strong>WITHOUT</strong> saving</li>
					<li>&quot;:w&quot; to save a document</li>
					<li>&quot;:wq&quot; to save and quit</li>
					<li>&quot;:split&quot; to split your screen into two separate panels</li>
					<li>&quot;:vs&quot; to vertically split your screen</li>
					<li>&quot;:tabnew&quot; to open a tew tab which you can toggle between with &quot;gt&quot; and &quot;gT&quot; (forward and backward)</li>
					<li>&quot;:e&quot; to load all edits and updates (useful if you have multiple browsers and tabs with vimnotion open</li>
				</ul>
				<div>
					For more information on VimNotion&quot;s built-in commands, see the <a href="/docs/editor" target="_self">Editor Features</a>
				</div>
			</div>
		</div>
	);
}
