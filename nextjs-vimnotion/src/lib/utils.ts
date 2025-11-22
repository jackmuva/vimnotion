/* eslint-disable  @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return function(this: any, ...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}
