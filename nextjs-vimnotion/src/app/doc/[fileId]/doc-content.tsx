"use client";

import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

interface DocContentProps {
	id: string;
	content: string;
}

export function DocContent({ id, content }: DocContentProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.querySelectorAll("pre code").forEach((element) => {
				hljs.highlightElement(element as HTMLElement);
			});
		}
	}, [content]);

	return (
		<div
			ref={containerRef}
			id={`md-editor-${id}`}
			className="no-scrollbar pb-20 h-full max-w-[1100px] w-full overflow-y-scroll"
		>
			<Markdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					pre({ children, ...props }: any) {
						return (
							<pre
								className="bg-gray-900 rounded-lg overflow-x-auto p-4 my-4"
								{...props}
							>
								{children}
							</pre>
						);
					},
					code({ inline, className, children, ...props }: any) {
						if (!inline && className) {
							return (
								<code className={className} {...props}>
									{children}
								</code>
							);
						}

						return (
							<code
								className="bg-gray-800 px-2 py-1 rounded text-sm font-mono"
								{...props}
							>
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
