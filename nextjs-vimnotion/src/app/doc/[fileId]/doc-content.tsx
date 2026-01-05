"use client";

import { useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SyntaxHighlighterWrapper } from "./syntax-highlighter-wrapper";

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
		<div
			id={`md-editor-${id}`}
			className="no-scrollbar pb-20 h-full max-w-[1100px] w-full overflow-y-scroll"
			suppressHydrationWarning
		>
			<Markdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					code({ node, inline, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || '');

						return !inline && match ? (
							<SyntaxHighlighterWrapper
								language={match[1]}
								children={String(children).replace(/\n$/, '')}
							/>
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
