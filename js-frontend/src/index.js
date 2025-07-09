import { vim } from "@replit/codemirror-vim"
import { basicSetup, EditorView } from "codemirror"

let view = new EditorView({
	doc: "",
	extensions: [
		// make sure vim is included before other keymaps
		vim(),
		// include the default keymap and all other keymaps you want to use in insert mode
		basicSetup,
	],
	parent: document.getElementById('full-text-container'),
})
