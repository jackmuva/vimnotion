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

document.addEventListener('keyup', (e) => {
	console.log(e);
	if (e.key === 'Escape') {
		mode = VIM_MODE.NORMAL
		document.getElementById('vim-command-line').innerHTML = "";
	} else if (mode === VIM_MODE.NORMAL) {
		handleNormalKey(e.key);
	} else if (mode === VIM_MODE.INSERT) {

	}
	document.getElementById('mode-container').innerHTML = mode;
});

/**
* @param {string} key 
* @returns {void}
*/
function handleNormalKey(key) {
	let curInput = document.getElementById('vim-command-line').innerHTML
	if (key === 'Backspace') {
		curInput = curInput.slice(0, -1);
	} else if (key === 'Enter') {
		handleNormalCommand(curInput);
		curInput = "";
	} else if (key === "Shift") {
		return;
	} else if (key === 'i') {
		mode = VIM_MODE.INSERT;
		curInput = "";
	} else if (key === 'I') {
		mode = VIM_MODE.INSERT;
		curInput = "";
	} else if (key === 'a') {
		mode = VIM_MODE.INSERT;
		curInput = "";
	} else if (key === 'A') {
		mode = VIM_MODE.INSERT;
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

