import { EditorView } from 'codemirror';
export const customTheme = EditorView.theme({
	"&": {
		color: "white",
		backgroundColor: "#034"
	},
	".cm-content": {
		caretColor: "black"
	},
}, { dark: false });

