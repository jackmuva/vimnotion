"use client";

import dynamic from "next/dynamic";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const SyntaxHighlighter = dynamic(
	() => import("react-syntax-highlighter").then((mod) => mod.Prism),
	{ ssr: false }
);

interface SyntaxHighlighterWrapperProps {
	language: string;
	children: string;
}

export function SyntaxHighlighterWrapper({
	language,
	children,
}: SyntaxHighlighterWrapperProps) {
	return (
		<SyntaxHighlighter style={gruvboxDark} PreTag="div" language={language}>
			{children}
		</SyntaxHighlighter>
	);
}
