import { handleInsertKey } from "./lib/insert-module.js";
import { handleNormalKey } from "./lib/normal-module.js";
import { moveCursor } from "./lib/utils.js";
import { VIM_MODE } from "./types/typedef.js";

/** @type {string} */
const fullTextContainer = `<div contenteditable="false" id='editor' class="h-full w-full outline-none wrap-anywhere">`;
/** @type {string} */
const closingDiv = "</div>";
/** @type {import("./types/typedef.js").VimState} */
let state = {
	mode: VIM_MODE.NORMAL,
	rowNum: 0,
	colNum: 0,
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('full-text-container').innerHTML = fullTextContainer
		+ (localStorage.getItem('content') ?? "_")
		+ closingDiv;
	moveCursor(state);
});

document.addEventListener('keyup', (e) => {
	console.log(e);
	if (state.mode === VIM_MODE.NORMAL) {
		state = handleNormalKey(e.key, state);
	} else if (state.mode === VIM_MODE.INSERT) {
		state = handleInsertKey(e.key, state);
	}
	document.getElementById('mode-container').innerHTML = state.mode;
});
