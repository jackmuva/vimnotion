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
			//NOTE:we can change text color here
			// color: "white",
		},
	})
)

const iceBlue = "#c8d6dc";
const snowWhite = "#f5f7f7";
const luminousPeach = "#f8dcc9";
const starryYellow = "#f0e2cd";

export const markdownDark = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: "#83a598",
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: "#8ec07c",
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: "#8ec07c",
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: "#fe8019",
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: "#fe8019",
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: "#d3869b",
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
	},
	{
		tag: tags.link,
		color: "#b8bb26",
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: "#b8bb26"
	},
	// Code
	{
		tag: tags.monospace,
		color: "#fabd2f"
	},
	{
		tag: tags.processingInstruction,
		color: "#fabd2f"
	},
	// Inline code
	{
		tag: tags.string,
		color: "#fabd2f"
	},
	// Blockquotes
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: "#8ec07c"
	},
	{
		tag: tags.punctuation,
		color: "#928374"
	},
	{
		tag: tags.list,
		color: "#b8bb26"
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: "#928374"
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: "#fe8019"
	},
	{
		tag: tags.attributeName,
		color: "#b8bb26"
	},
]);

export const markdownLight = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: "#427b58",
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: "#558a5a",
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: "#558a5a",
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: "#af3a03",
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: "#af3a03",
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: "#8f3f71",
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
	},
	{
		tag: tags.link,
		color: "#6f8735",
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: "#6f8735"
	},
	// Code
	{
		tag: tags.monospace,
		color: "#b57614"
	},
	{
		tag: tags.processingInstruction,
		color: "#b57614"
	},
	// Inline code
	{
		tag: tags.string,
		color: "#b57614"
	},
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: "#558a5a"
	},
	{
		tag: tags.punctuation,
		color: "#7c6f64"
	},
	{
		tag: tags.list,
		color: "#6f8735"
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: "#7c6f64"
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: "#af3a03"
	},
	{
		tag: tags.attributeName,
		color: "#6f8735"
	},
]);
