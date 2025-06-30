import { handleInsertKey } from "./markdown-module.js";
import { handleNormalKey } from "./normal-module.js";
import { VIM_MODE } from "./types/typedef.js";

//NOTE: These are my states

/** @type {import("./types/typedef.js").VimMode} */
let mode = VIM_MODE.NORMAL;

let fullTextContainer = `
	<div contenteditable="false" id='editor' class="h-full w-full outline-none wrap-anywhere">
`;
const closingDiv = "</div>";

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('full-text-container').innerHTML = fullTextContainer
		+ (localStorage.getItem('content') ?? "")
		+ closingDiv;
});

document.addEventListener('keyup', (e) => {
	console.log(e);
	if (mode === VIM_MODE.NORMAL) {
		mode = handleNormalKey(e.key, mode);
	} else if (mode === VIM_MODE.INSERT) {
		mode = handleInsertKey(e.key, mode);
	}
	document.getElementById('mode-container').innerHTML = mode;
});
