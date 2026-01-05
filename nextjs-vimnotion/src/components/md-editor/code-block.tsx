"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
	node?: any;
	inline?: boolean;
	className?: string;
	children?: React.ReactNode;
	[key: string]: any;
}

export const CodeBlock = ({ node, inline, className, children, ...props }: CodeBlockProps) => {
	const match = /language-(\w+)/.exec(className || '');

	if (!inline && match) {
		return (
			<SyntaxHighlighter
				style={gruvboxDark}
				PreTag="div"
				language={match[1]}
				{...props}
			>
				{String(children).replace(/\n$/, '')}
			</SyntaxHighlighter>
		);
	}

	return (
		<code className={className} {...props}>
			{children}
		</code>
	);
};
