/** @typedef {keyof typeof VIM_MODE} VimMode **/
/** @enum {VimMode} **/
export const VIM_MODE = Object.freeze({
	NORMAL: 'Normal',
	INSERT: 'Insert',
	VISUAL: 'Visual',
	V_LINE: 'V-Line',
});
