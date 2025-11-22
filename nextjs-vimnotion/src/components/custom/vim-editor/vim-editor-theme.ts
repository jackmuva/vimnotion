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

// Kanagawa Wave palette (dark theme inspired)
const kanagawaDarkCarpYellow = "#E6C384";
const kanagawaDarkPeachRed = "#FF5D62";
const kanagawaDarkSakuraPink = "#D27E99";
const kanagawaDarkCrystalBlue = "#7E9CD8";
const kanagawaDarkSpringGreen = "#98BB6C";
const kanagawaDarkOniViolet = "#957FB8";
const kanagawaDarkSpringBlue = "#7FB4CA";
const kanagawaDarkFujiGray = "#727169";


export const markdownDark = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: kanagawaDarkCarpYellow,
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: kanagawaDarkPeachRed,
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: kanagawaDarkSakuraPink,
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: kanagawaDarkCrystalBlue,
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: kanagawaDarkSpringGreen,
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: kanagawaDarkOniViolet,
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
		color: kanagawaDarkSpringBlue,
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
		color: kanagawaDarkSakuraPink,
	},
	{
		tag: tags.link,
		color: kanagawaDarkCrystalBlue,
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: kanagawaDarkCrystalBlue
	},
	// Code
	{
		tag: tags.monospace,
		color: kanagawaDarkCarpYellow
	},
	{
		tag: tags.processingInstruction,
		color: kanagawaDarkCarpYellow
	},
	// Inline code
	{
		tag: tags.string,
		color: kanagawaDarkSpringGreen
	},
	// Blockquotes
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: kanagawaDarkFujiGray
	},
	{
		tag: tags.punctuation,
		color: kanagawaDarkFujiGray
	},
	{
		tag: tags.list,
		color: kanagawaDarkPeachRed
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: kanagawaDarkFujiGray
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: kanagawaDarkCrystalBlue
	},
	{
		tag: tags.attributeName,
		color: kanagawaDarkCarpYellow
	},
]);

// Kanagawa Lotus palette (light theme inspired)
const kanagawaLightViolet = "#766b90";
const kanagawaLightRed = "#c4746e";
const kanagawaLightGreen = "#597c5c";
const kanagawaLightYellow = "#c4b28a";
const kanagawaLightBlue = "#4d8fd4";
const kanagawaLightPink = "#b35b79";
const kanagawaLightAqua = "#597c5c";
const kanagawaLightGray = "#716e61";


export const markdownLight = HighlightStyle.define([
	{
		tag: tags.heading1,
		color: kanagawaLightBlue,
		fontWeight: "bold",
	},
	{
		tag: tags.heading2,
		color: kanagawaLightRed,
		fontWeight: "bold",
	},
	{
		tag: tags.heading3,
		color: kanagawaLightViolet,
		fontWeight: "bold",
	},
	{
		tag: tags.heading4,
		color: kanagawaLightYellow,
		fontWeight: "bold",
	},
	{
		tag: tags.heading5,
		color: kanagawaLightGreen,
		fontWeight: "bold",
	},
	{
		tag: tags.heading6,
		color: kanagawaLightPink,
		fontWeight: "bold",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
		color: kanagawaLightAqua,
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
		color: kanagawaLightPink,
	},
	{
		tag: tags.link,
		color: kanagawaLightBlue,
		textDecoration: "underline"
	},
	{
		tag: tags.url,
		color: kanagawaLightBlue
	},
	// Code
	{
		tag: tags.monospace,
		color: kanagawaLightYellow
	},
	{
		tag: tags.processingInstruction,
		color: kanagawaLightYellow
	},
	// Inline code
	{
		tag: tags.string,
		color: kanagawaLightYellow
	},
	{
		tag: tags.quote,
		fontStyle: "italic",
		color: kanagawaLightGray
	},
	{
		tag: tags.punctuation,
		color: kanagawaLightGray
	},
	{
		tag: tags.list,
		color: kanagawaLightPink
	},
	// Horizontal rules / separators
	{
		tag: tags.escape,
		color: kanagawaLightGray
	},
	// HTML tags in markdown
	{
		tag: tags.tagName,
		color: kanagawaLightBlue
	},
	{
		tag: tags.attributeName,
		color: kanagawaLightYellow
	},
]);
