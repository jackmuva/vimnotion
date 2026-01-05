"use client";

import { useEffect } from "react";
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

	useEffect(() => {
		const links = document.getElementsByTagName('a');
		for (const link of links) {
			link.setAttribute('target', '_blank');
		}
	}, [content])

	return (
		<div id={`md-editor-${id}`}
			className="no-scrollbar pb-20 h-full max-w-[1100px] w-full overflow-y-scroll">
			<Markdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
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
