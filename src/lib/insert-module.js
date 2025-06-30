import { VIM_MODE } from "../types/typedef.js";
import { removeSpan, moveCursor } from "./utils.js";

/**
 * @param {string} key 
 * @param {import("../types/typedef.js").VimState} state 
 * @returns {import("../types/typedef.js").VimState}
 */
export function handleInsertKey(key, state) {
	if (key === 'Escape') {
		state.mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
		document.getElementById('editor').contentEditable = "false";
		state = convertToMarkdown(state);
	}
	return state;
}

/**
 * @param {string} key 
 * @param {import("../types/typedef.js").VimState} state 
 * @returns {import("../types/typedef.js").VimState}
 */
export function handleInsertInitiate(key, state) {
	if (key === 'i') {
		state.mode = VIM_MODE.INSERT;
		console.log(window.document.getElementById('editor').innerHTML.toString());
		removeSpan();
		console.log(window.document.getElementById('editor').innerHTML.toString());
		initInsert();
	} else if (key === 'I') {
		state.mode = VIM_MODE.INSERT;
		removeSpan();
		initInsert();
	} else if (key === 'a') {
		state.mode = VIM_MODE.INSERT;
		removeSpan();
		initInsert();
	} else if (key === 'A') {
		state.mode = VIM_MODE.INSERT;
		removeSpan();
		initInsert();
	}
	return state;
}

/**
 * @returns {void}
 */
function initInsert() {
	document.getElementById('editor').contentEditable = "true";
	document.getElementById('editor').focus();
}



/**
 * @param {import("../types/typedef.js").VimState} state 
 * @returns {import("../types/typedef.js").VimState}
*/
function convertToMarkdown(state) {
	moveCursor(state);
	return state;
}


