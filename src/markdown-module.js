import { VIM_MODE } from "./types/typedef.js";

/**
 * @param {string} key 
 * @param {import("./types/typedef").VimMode} mode
 * @returns {import("./types/typedef.js").VimMode}
 */
export function handleInsertKey(key, mode) {
	if (key === 'Escape') {
		mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
		document.getElementById('editor').contentEditable = false;
		convertToMarkdown();
	}
	return mode;
}

export function handleInsertInitiate(key, mode) {
	if (key === 'i') {
		mode = readyInsert(mode);
	} else if (key === 'I') {
		mode = readyInsert(mode);
	} else if (key === 'a') {
		mode = readyInsert(mode);
	} else if (key === 'A') {
		mode = readyInsert(mode);
	}
	return mode;
}


/**
* @returns {void}
*/
function convertToMarkdown() {
	let index = 3;
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().slice(0, index) +
		'<span id="cursor">' +
		document.getElementById('editor').innerHTML.toString().slice(index, index + 1) +
		'</span><!-- closing span -->' +
		document.getElementById('editor').innerHTML.toString().slice(index + 1);
}

/**
* @param {string} mode 
* @returns {import("./types/typedef.js").VimMode}
*/
function readyInsert(mode) {
	console.log(document.getElementById('editor').innerHTML.toString())
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().replace('<span id="cursor">', "")
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().replace('</span><!-- closing span -->', '');
	console.log(document.getElementById('editor').innerHTML.toString())
	mode = VIM_MODE.INSERT;
	document.getElementById('editor').contentEditable = true;
	document.getElementById('editor').focus();
	return mode;
}
