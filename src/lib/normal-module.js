import { handleInsertInitiate } from "./insert-module.js";
import { VIM_MODE } from "../types/typedef.js";
import { moveCursor } from "./utils.js";

/**
* @param {string} key 
* @param {import("../types/typedef.js").VimState} state
* @returns {import("../types/typedef.js").VimState}
*/
export function handleNormalKey(key, state) {
	let curInput = document.getElementById('vim-command-line').innerHTML;
	if (curInput.charAt(0) !== ":") {
		curInput = "";
	}

	if (key === 'Escape') {
		state.mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
		document.getElementById('editor').contentEditable = "false";
	} else if (key === 'Backspace') {
		curInput = curInput.slice(0, -1);
	} else if (key === 'Enter') {
		handleNormalCommand(curInput);
		curInput = "";
	} else if (key === "Shift") {
	} else if (key === 'i' || key === "I" || key === "a" || key === "A") {
		state = handleInsertInitiate(key, state);
		curInput = "";
	} else if (key === 'v') {
		state.mode = VIM_MODE.VISUAL;
		curInput = "";
	} else if (key === 'V') {
		state.mode = VIM_MODE.V_LINE;
		curInput = "";
	} else if (key === "h") {
		state.colNum > 0 ? state.colNum -= 1 : state.colNum = 0;
		moveCursor(state);
	} else if (key === "l") {
		state.colNum < 100 ? state.colNum += 1 : state.colNum = 100;
		moveCursor(state);
	} else {
		curInput += key;
	}
	document.getElementById('vim-command-line').innerHTML = curInput;
	return state;
}

/**
 * @param {string} command  
 * @returns {void}
 */
export function handleNormalCommand(command) {
	if (command === ":w") {
		localStorage.setItem('content', document.getElementById('editor').innerHTML);
	} else if (command === ":q") {
		window.location.reload();
	}
}

