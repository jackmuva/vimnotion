/**
 * @param {import("../types/typedef.js").VimState} state 
 * @returns {void}
*/
export function moveCursor(state) {
	removeSpan();
	let index = state.colNum;
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().slice(0, index) +
		'<span id="cursor">' +
		document.getElementById('editor').innerHTML.toString().slice(index, index + 1) +
		'</span><!--closingspan-->' +
		document.getElementById('editor').innerHTML.toString().slice(index + 1);
}

/**
* @returns {void}
*/
export function removeSpan() {
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().replace('<span id="cursor">', "")
	console.log(document.getElementById('editor').innerHTML.toString().replace('</span><!--closingspan-->', ""));
	document.getElementById('editor').innerHTML = document.getElementById('editor').innerHTML.toString().replace('</span><!--closingspan-->', '');
}
