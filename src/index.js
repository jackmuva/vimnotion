/** @typedef {keyof typeof VIM_MODE} VimMode **/
/** @enum {VimMode} **/
export const VIM_MODE = Object.freeze({
	NORMAL: 'Normal',
	INSERT: 'Insert',
	VISUAL: 'Visual',
	V_LINE: 'V-Line',
});

/** @type {VimMode} */
let mode = VIM_MODE.NORMAL;

/**
 * Updates the cursor style based on the current vim mode
 * @returns {void}
 */
function updateCursorStyle() {
	const editor = document.getElementById('editor');

	editor.classList.remove('vim-normal-cursor');

	if (mode === VIM_MODE.NORMAL || mode === VIM_MODE.VISUAL || mode === VIM_MODE.V_LINE) {
		editor.classList.add('vim-normal-cursor');
	}
	console.log(editor.classList);
}

// Initialize cursor style on page load
document.addEventListener('DOMContentLoaded', () => {
	updateCursorStyle();
});

document.addEventListener('keyup', (e) => {
	console.log(e);
	if (e.key === 'Escape') {
		mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
		document.getElementById('editor').readOnly = true;
	} else if (mode === VIM_MODE.NORMAL) {
		handleNormalKey(e.key);
	} else if (mode === VIM_MODE.INSERT) {
	}
	document.getElementById('mode-container').innerHTML = mode;
	updateCursorStyle();
});

/**
* @param {string} key 
* @returns {void}
*/
function handleNormalKey(key) {
	let curInput = document.getElementById('vim-command-line').innerHTML
	if (curInput.charAt(0) !== ":") {
		curInput = "";
	}

	if (key === 'Backspace') {
		curInput = curInput.slice(0, -1);
	} else if (key === 'Enter') {
		handleNormalCommand(curInput);
		curInput = "";
	} else if (key === "Shift") {
		return;
	} else if (key === 'i') {
		mode = VIM_MODE.INSERT;
		document.getElementById('editor').readOnly = false;
		curInput = "";
	} else if (key === 'I') {
		mode = VIM_MODE.INSERT;
		document.getElementById('editor').readOnly = false;
		curInput = "";
	} else if (key === 'a') {
		mode = VIM_MODE.INSERT;
		document.getElementById('editor').readOnly = false;
		curInput = "";
	} else if (key === 'A') {
		mode = VIM_MODE.INSERT;
		document.getElementById('editor').readOnly = false;
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
}

/**
 * @param {string} command  
 * @returns {void}
 */
function handleNormalCommand(command) {
	if (command === ":w") {
		console.log('save');
	} else if (command === ":q") {
		window.close()
	}
}

