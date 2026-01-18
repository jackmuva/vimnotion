"use server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "Editor Documentation | VimNotion",
		description: "Master VimNotion's editor with Vim commands, leader keybindings, and file directory management.",
		openGraph: {
			title: "Editor Documentation | VimNotion",
			description: "Master VimNotion's editor with Vim commands, leader keybindings, and file directory management.",
			type: "article",
		},
	};
	return metadata;
}

export default async function EditorDocsPage() {
	return (
		<div className="w-full">
			<div id="md-editor-docs" className="flex flex-col w-full max-w-[1100px] gap-4 overflow-y-auto pb-20 px-4">
				<h1>
					VimNotion Editor Docs
				</h1>
				<h2>
					VimNotion Commands
				</h2>
				<div>
					VimNotion was built to be basically like Vim for notes and documents.
					The base editor has all of the base vim motions for navigating and editing a file.
				</div>
				<div>
					However, VimNotion does not have all of the commands included in Vim, opting
					to include the most important ones for a notes and documents app.
					Here&quot;s what&quot;s included:
				</div>
				<div>
					to save a file
					<pre>:w</pre>
				</div>
				<div>
					to close a file <strong>WITHOUT saving</strong>
					<pre>:q</pre>
				</div>
				<div>
					to close a file <strong>AFTER saving</strong>
					<pre>:wq</pre>
				</div>
				<div>
					to split screen <strong>vertically</strong>
					<pre>:vsplit</pre>
					<pre>:vs</pre>
				</div>
				<div>
					to split screen <strong>horizontally</strong>
					<pre>:split</pre>
				</div>
				<div>
					to open a new tab
					<pre>:tabnew</pre>
				</div>
				<h2>
					VimNotion Leader Keybindings
				</h2>
				<div>
					VimNotion&quot;s keybindings are built-in with the editor for common actions like inserting images
					and rendering markdown. While we don&quot;t offer configurable keybindings at this time,
					the default keybindings should feel natural and intuitive.
				</div>
				<div className="font-bold italic">
					Use Space (the leader key) to bring up the leader menu
				</div>
				<div>
					to render [m]arkdown
					<pre>{`<Space>m`}</pre>
				</div>
				<div>
					to [s]earch all files
					<pre>{`<Space>s`}</pre>
				</div>
				<div>
					to [i]nsert an [i]mage
					<pre>{`<Space>i`}</pre>
				</div>
				<div>
					to [p]ublish a page publically
					<pre>{`<Space>p`}</pre>
				</div>
				<div>
					to navigate [w]indows after splitting your view
					<pre>{`<Space>w`}</pre>
				</div>
				<div>
					to use [a]i feature
					<pre>{`<Space>a`}</pre>
				</div>

				<h2>
					VimNotion&apos;s File Directory
				</h2>
				<div>
					VimNotion&quot;s file directory is heavily inspired by <strong>oil.nvim</strong>
				</div>
				<div>
					Open the file directory with
					<pre>-</pre>
					Once the sidebar is open, create new directories (folders) by typing the
					directory name followed by <strong>/ on its own line</strong>
					<pre>new_folder/</pre>
					create new files by typing the file name <strong>without an ending /</strong>
					<pre>new_file</pre>
					You can also rename, copy, and delete files and directories by deleting their
					lines in the sidebar.
				</div>
				<div>
					Like the normal VimNotion editor, use
					<pre>:w</pre>
					to save your directory changes
				</div>
			</div>
		</div>
	);
}
