import { Prec } from '@codemirror/state';
import { EditorView } from 'codemirror';
import { tags } from "@lezer/highlight"
import { HighlightStyle } from "@codemirror/language"

export const customTheme = Prec.highest(
	EditorView.theme({
		".cm-fat-cursor": {
			background: "#818cf8",
		},
		"&:not(.cm-focused) .cm-fat-cursor": {
			background: "none",
			outline: "solid 1px #818cf8",
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

const brilliantYellow = "#ffd497";
const glowingCoral = "#eda09c";
const luminousOrchid = "#d1b6cb";
const iceBlue = "#c8d6dc";


export const markdownDark = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: brilliantYellow,
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: glowingCoral,
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: luminousOrchid,
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: iceBlue,
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: brilliantYellow,
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: glowingCoral,
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
		color: iceBlue,
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
		color: luminousOrchid,
	},
	{
		tag: tags.link,
		color: luminousOrchid,
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: glowingCoral
	},
	// Code
	{
		tag: tags.monospace,
		color: luminousOrchid
	},
	{
		tag: tags.processingInstruction,
		color: brilliantYellow
	},
	// Inline code
	{
		tag: tags.string,
		color: iceBlue
	},
	// Blockquotes
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: iceBlue
	},
	{
		tag: tags.punctuation,
		color: brilliantYellow
	},
	{
		tag: tags.list,
		color: iceBlue
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: iceBlue
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: luminousOrchid
	},
	{
		tag: tags.attributeName,
		color: iceBlue
	},
]);

// Kanagawa Lotus palette (light theme inspired)
const kanagawaViolet = "#766b90";
const kanagawaRed = "#c4746e";
const kanagawaGreen = "#597c5c";
const kanagawaYellow = "#c4b28a";
const kanagawaBlue = "#4d8fd4";
const kanagawaPink = "#b35b79";
const kanagawaAqua = "#597c5c";
const kanagawaGray = "#716e61";


export const markdownLight = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: kanagawaBlue,
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: kanagawaRed,
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: kanagawaViolet,
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: kanagawaYellow,
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: kanagawaGreen,
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: kanagawaPink,
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
		color: kanagawaAqua,
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
		color: kanagawaPink,
	},
	{
		tag: tags.link,
		color: kanagawaBlue,
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: kanagawaBlue
	},
	// Code
	{
		tag: tags.monospace,
		color: kanagawaViolet,
	},
	{
		tag: tags.processingInstruction,
		color: kanagawaYellow
	},
	// Inline code
	{
		tag: tags.string,
		color: kanagawaYellow
	},
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: kanagawaGray
	},
	{
		tag: tags.punctuation,
		color: kanagawaGray
	},
	{
		tag: tags.list,
		color: kanagawaPink
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: kanagawaGray
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: kanagawaBlue
	},
	{
		tag: tags.attributeName,
		color: kanagawaYellow
	},
]);
