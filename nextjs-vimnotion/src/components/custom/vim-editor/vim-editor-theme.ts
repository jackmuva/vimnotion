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

export const markdownHighlighting = HighlightStyle.define([
	{
		tag: tags.heading1,
		fontWeight: "bold"
	},
	{
		tag: tags.heading2,
		fontWeight: "bold"
	},
	{
		tag: tags.heading3,
		fontWeight: "bold"
	},
	{
		tag: tags.heading4,
		fontWeight: "bold"
	},
	{
		tag: tags.heading5,
		fontWeight: "bold"
	},
	{
		tag: tags.heading6,
		fontWeight: "bold"
	},
]);
