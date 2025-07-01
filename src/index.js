import { handleInsertKey } from "./lib/insert-module.js";
import { handleNormalKey } from "./lib/normal-module.js";
import { moveCursor, countRowsCols } from "./lib/utils.js";
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
	const rowMap = countRowsCols();
	moveCursor(state, rowMap);
});

document.addEventListener('keydown', (event) => {	
	if (state.mode === VIM_MODE.NORMAL) {
		state = handleNormalKey(event.key, state, event);
	} else if (state.mode === VIM_MODE.INSERT) {
		state = handleInsertKey(event.key, state);
	}
	document.getElementById('mode-container').innerHTML = state.mode;
});
