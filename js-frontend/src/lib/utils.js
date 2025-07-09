/**
 * @param {import("../types/typedef.js").VimState} state 
 * @param {Map<number, string>} rowMap 
 * @returns {void}
*/
export function moveCursor(state, rowMap) {
	console.log(state);
	console.log(rowMap);
	removeSpan();
	let divContent = "";
	for (let i = 0; i < rowMap.size; i += 1) {
		let rowText = rowMap.get(i);
		if (i === state.rowNum) {
			divContent += (rowText.slice(0, state.colNum) +
				'<span id="cursor">' +
				rowText.slice(state.colNum, state.colNum + 1) +
				'</span><!--closingspan-->' +
				rowText.slice(state.colNum + 1));
		} else {
			divContent += rowText;
		}
	}
	document.getElementById('editor').innerHTML = divContent;
}

/**
* @returns {void}
*/
export function removeSpan() {
	let editorContent = document.getElementById('editor').innerHTML.toString();
	editorContent = editorContent.replace('<span id="cursor">', "");
	editorContent = editorContent.replace('</span><!--closingspan-->', '');
	document.getElementById('editor').innerHTML = editorContent;

}/**
* @returns {Map<number, string>}
*/
export function countRowsCols() {
	const paragraph = document.getElementById('editor');
	let text = paragraph.textContent;
	let textArr = text.split("");
	let line = document.createElement("span");
	paragraph.insertBefore(line, paragraph.firstChild);
	let charCount = 0;
	let lineNo = 0;
	let lineY = line.offsetHeight;
	let lineContent = "";
	const resMap = new Map();

	textArr.forEach((char, i) => {
		line.textContent += char;
		lineContent += char;
		charCount++;
		let currentY = line.offsetHeight;
		if (currentY > lineY) {
			lineContent = lineContent.slice(0, -1); // Remove the wrap-causing character
			resMap.set(lineNo, lineContent);
			lineY = currentY;
			charCount = 1;
			lineNo++;
			lineContent = char; // Start next line with the wrap-causing character
		} else if (i == textArr.length - 1) {
			resMap.set(lineNo, lineContent);
		}
	});
	line.remove();

	return resMap;
}
