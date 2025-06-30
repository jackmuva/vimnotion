import { handleInsertInitiate } from "./markdown-module.js";
import { VIM_MODE } from "./types/typedef.js";

/**
* @param {string} key 
* @param {import("./types/typedef").VimMode} mode 
* @returns {import("./types/typedef").VimMode}
*/
export function handleNormalKey(key, mode) {
	let curInput = document.getElementById('vim-command-line').innerHTML;
	if (curInput.charAt(0) !== ":") {
		curInput = "";
	}

	if (key === 'Escape') {
		mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
		document.getElementById('editor').contentEditable = false;
	} else if (key === 'Backspace') {
		curInput = curInput.slice(0, -1);
	} else if (key === 'Enter') {
		handleNormalCommand(curInput);
		curInput = "";
	} else if (key === "Shift") {
	} else if (key === 'i' || key === "I" || key === "a" || key === "A") {
		mode = handleInsertInitiate(key, mode);
		curInput = "";
	} else if (key === 'v') {
		mode = VIM_MODE.VISUAL;
		curInput = "";
	} else if (key === 'V') {
		mode = VIM_MODE.V_LINE;
		curInput = "";
	} else {
		curInput += key;
	}
	document.getElementById('vim-command-line').innerHTML = curInput;
	return mode;
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

