"use server";

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
					for menu options, ***you can create headers, bullets, links or bold, italic, underline<br />
					text*** directly in your text with Markdown syntax.
				</div>
				<div>
					VimNotion is all about flow, so keeping your hands on your keyboard with the ability to
					move at the speed of your thoughts is what it&quot;s all about.
				</div>
				<h2>
					Markdown Basics
				</h2>
				<pre>
					This is the base text. <br /><br />
					Two newlines (enter keys) to start a new line. One newline will just continue your paragraph,<br />
					so for example, this sentence will still be just one line.
				</pre>
				<div>
					This is the base text.
				</div>
				<div>
					Two newlines (enter keys) to start a new line. One newline will just continue your paragraph,
					so for example, this sentence will still be just one line.
				</div>

				<hr />
				<pre>
					# One hashtag followed by a space for a heading 1<br />
					## Two hashtags for a heading 2<br />
					### ... so on and so forth<br />
				</pre>
				<h1>
					One hashtag followed by a space for a heading 1
				</h1>
				<h2>
					Two hashtags for a heading 2
				</h2>
				<h3>
					... so on and so forth
				</h3>
				<hr />
				<pre>
					* a star followed by a space for a bullet list<br />
					* second item<br />
					* ...
				</pre>
				<ul>
					<li>
						a star followed by a space for a bullet list
					</li>
					<li>
						second item
					</li>
					<li>
						...
					</li>
				</ul>
				<hr />
				<pre>
					1. A number followed by a period followed by a space for an ordered list<br />
					2. second item<br />
					3. ...<br />
				</pre>
				<ol>
					<li>
						1. A number followed by a period followed by a space for an ordered list
					</li>
					<li>
						2. second item
					</li>
					<li>
						3. ...
					</li>
				</ol>
				<hr />
				<div>
					<pre>
						Bold text with two stars **bolded**, italicize text with one star *italicized*.
					</pre>
					Bold text with two stars <strong>bolded</strong>, italicize text with one star <em>italicized</em>.
				</div>
				<hr />
				<h2>
					More Markdown
				</h2>
				<pre>
					Link external websites with this bracket/parentheses syntax <br />
					[clickable text that will link to]({process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/editor)
				</pre>
				<div>
					Link external websites with this bracket/parentheses syntax&nbsp;
					<a href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/editor`} target="_blank">
						clickable text that will link to
					</a>
				</div>
				<hr />
				<pre>
					Images have similar syntax, but include an &apos;!&apos;<br />
					![alt text for the image]({process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/8df757fa-2252-4991-81e8-ece73eaec11f)
				</pre>
				Images have similar syntax, but include an &apos;!&apos;
				<img src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/8df757fa-2252-4991-81e8-ece73eaec11f`}
					alt="alt text for the image" />
				<hr />
				<pre>
					&gt; For block quotes, use the &apos;&gt;&apos; character<br />
					&gt;<br />
					&gt; add an emty line for multi-line block quotes<br />
				</pre>
				<blockquote>
					For block quotes, use the &apos;&gt;&apos; character
					<br />
					add an emty line for multi-line block quotes
				</blockquote>
				<hr />
				<pre>
					```javascript<br />
					use 3 backticks with the language name for codeblocks<br />
					(the language name is optional, but some markdown editors will<br />
					have syntax highlighting)<br />
					```<br />
				</pre>
				<pre>
					use 3 backticks with the language name for codeblocks<br />
					(the language name is optional, but some markdown editors will<br />
					have syntax highlighting)<br />
				</pre>
			</div>
		</div>
	);
}
