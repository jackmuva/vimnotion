import { Prec } from '@codemirror/state';
import { EditorView } from 'codemirror';
import { tags } from "@lezer/highlight"
import { HighlightStyle } from "@codemirror/language"

export const customTheme = Prec.highest(
	EditorView.theme({
		".cm-fat-cursor": {
			background: "#d2d7c6",
		},
		"&:not(.cm-focused) .cm-fat-cursor": {
			background: "none",
			outline: "solid 1px #d2d7c6",
			color: "transparent !important",
		},
		".cm-gutters": {
			background: "none",
		},
		"&.cm-editor": {
			backgroundColor: "transparent",
		},
		"&": {
			minHeight: "100%",
		},
	})
)

export const markdownDark = HighlightStyle.define([
	// Headings
	{
		tag: tags.heading1,
		color: "#60a5fa",
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: "#2563eb",
		fontWeight: "bold",
	},
	// Emphasis
	{
		tag: tags.emphasis,
		fontStyle: "italic",
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
	},
	// Links and URLs
	{
		tag: tags.link,
		color: "#a6e22e",
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: "#a6e22e"
	},
	// Code
	{
		tag: tags.monospace,
		color: "#e6db74"
	},
	{
		tag: tags.processingInstruction,
		color: "#e6db74"
	},
	// Inline code
	{
		tag: tags.string,
		color: "#e6db74"
	},
	// Blockquotes
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: "#a1efe4"
	},
	// Punctuation
	{
		tag: tags.punctuation,
		color: "#75715e"
	},
	// Lists
	{
		tag: tags.list,
		color: "#a6e22e"
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: "#75715e"
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: "#f92672"
	},
	{
		tag: tags.attributeName,
		color: "#a6e22e"
	},
]);

export const markdownLight = HighlightStyle.define([
	// Headings
	{
		tag: tags.heading1,
		color: "#1e40af",
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: "#2563eb",
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: "#2563eb",
		fontWeight: "bold",
	},
	// Emphasis
	{
		tag: tags.emphasis,
		fontStyle: "italic",
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
	},
	// Links and URLs
	{
		tag: tags.link,
		color: "#a6e22e",
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: "#a6e22e"
	},
	// Code
	{
		tag: tags.monospace,
		color: "#e6db74"
	},
	{
		tag: tags.processingInstruction,
		color: "#e6db74"
	},
	// Inline code
	{
		tag: tags.string,
		color: "#e6db74"
	},
	// Blockquotes
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: "#a1efe4"
	},
	// Punctuation
	{
		tag: tags.punctuation,
		color: "#75715e"
	},
	// Lists
	{
		tag: tags.list,
		color: "#a6e22e"
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: "#75715e"
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: "#f92672"
	},
	{
		tag: tags.attributeName,
		color: "#a6e22e"
	},
]);
