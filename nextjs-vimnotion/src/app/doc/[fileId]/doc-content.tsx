"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const SyntaxHighlighter = dynamic(
	() => import("react-syntax-highlighter").then((mod) => mod.Prism),
	{ ssr: false }
);

interface DocContentProps {
	id: string;
	content: string;
}

export function DocContent({ id, content }: DocContentProps) {

	return (
		<div id={`md-editor-${id}`}
			className="no-scrollbar pb-20 h-full max-w-[900px] w-full overflow-y-scroll">
			<Markdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					a({ node, children, ...props }: any) {
						return <a target="_blank" {...props}>{children}</a>;
					},
					code({ node, inline, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || '');

						return !inline && match ? (
							<SyntaxHighlighter language={match[1]}
								PreTag="div"
								style={gruvboxDark}>
								{String(children).replace(/\n$/, '')}
							</SyntaxHighlighter>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</Markdown>
		</div>
	);
}
