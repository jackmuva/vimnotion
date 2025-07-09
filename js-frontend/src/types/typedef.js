/** @typedef {keyof typeof VIM_MODE} VimMode **/
/** @enum {VimMode} **/
export const VIM_MODE = Object.freeze({
	NORMAL: 'Normal',
	INSERT: 'Insert',
	VISUAL: 'Visual',
	V_LINE: 'V-Line',
});

/**
 * @typedef VimState 
 * @type {Object}
 * @property {string} mode 
 * @property {number} rowNum
 * @property {number} colNum
 */
