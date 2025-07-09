import { handleInsertInitiate } from "./insert-module.js";
import { VIM_MODE } from "../types/typedef.js";
import { moveCursor, countRowsCols } from "./utils.js";

/**
* @param {string} key 
* @param {import("../types/typedef.js").VimState} state
* @param {KeyboardEvent} event
* @returns {import("../types/typedef.js").VimState}
*/
export function handleNormalKey(key, state, event) {
	event.preventDefault();
	let curInput = document.getElementById('vim-command-line').innerHTML;
	const rowMap = countRowsCols();
	console.log(rowMap);

	if (curInput.charAt(0) !== ":") {
		curInput = "";
		if (key === 'i' || key === "I" || key === "a" || key === "A") {
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
			moveCursor(state, rowMap);
		} else if (key === "l") {
			state.colNum < rowMap.get(state.rowNum).length - 1 ? state.colNum += 1 : state.colNum = rowMap.get(state.rowNum).length - 1;
			moveCursor(state, rowMap);
		} else if (key === "j") {
			rowMap.has(state.rowNum + 1) ? state.rowNum += 1 : state.rowNum = state.rowNum;
			moveCursor(state, rowMap);
		} else if (key === "k") {
			rowMap.has(state.rowNum - 1) ? state.rowNum -= 1 : state.rowNum = state.rowNum;
			moveCursor(state, rowMap);
		}
	}

	if (key === 'Escape') {
		state.mode = VIM_MODE.NORMAL
		document.getElementById('editor').contentEditable = "false";
		curInput = "";
	} else if (key === 'Backspace') {
		curInput = curInput.slice(0, -1);
	} else if (key === 'Enter') {
		handleNormalCommand(curInput);
		curInput = "";
	} else if (key === "Shift") {
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


