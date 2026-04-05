import { unified } from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm';

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
export const rehypeToTiptap = (html: string): string => {
	let result = html;

	result = result.replace(
		/<ul class="contains-task-list">/g,
		'<ul class="contains-task-list" data-type="taskList">'
	);

	result = result.replace(
		/<li class="task-list-item">\s*<p><input type="checkbox"[^>]*?\bchecked\b[^>]*?>\s*([\s\S]*?)<\/p>\s*<\/li>/g,
		'<li class="task-list-item" data-checked="true" data-type="taskItem"><label contenteditable="false"><input type="checkbox"><span></span></label><div><p>$1</p></div></li>'
	);

	result = result.replace(
		/<li class="task-list-item"><input type="checkbox"[^>]*?\bchecked\b[^>]*?>\s*([\s\S]*?)<\/li>/g,
		'<li class="task-list-item" data-checked="true" data-type="taskItem"><label contenteditable="false"><input type="checkbox"><span></span></label><div><p>$1</p></div></li>'
	);

	result = result.replace(
		/<li class="task-list-item">\s*<p><input type="checkbox"(?![^>]*\bchecked\b)[^>]*?>\s*([\s\S]*?)<\/p>\s*<\/li>/g,
		'<li class="task-list-item" data-checked="false" data-type="taskItem"><label contenteditable="false"><input type="checkbox"><span></span></label><div><p>$1</p></div></li>'
	);

	result = result.replace(
		/<li class="task-list-item"><input type="checkbox"(?![^>]*\bchecked\b)[^>]*?>\s*([\s\S]*?)<\/li>/g,
		'<li class="task-list-item" data-checked="false" data-type="taskItem"><label contenteditable="false"><input type="checkbox"><span></span></label><div><p>$1</p></div></li>'
	);

	return result;
};

export const tiptapToRehype = (html: string): string => {
	let result = html;

	result = result.replace(
		/<ul class="contains-task-list" data-type="taskList">/g,
		'<ul class="contains-task-list">'
	);

	result = result.replace(
		/<li class="task-list-item" data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span><\/span><\/label><div><p>([^<]*)<\/p><\/div><\/li>/g,
		'<li class="task-list-item"><input type="checkbox" checked> $1</li>'
	);

	result = result.replace(
		/<li class="task-list-item" data-checked="false" data-type="taskItem"><label><input type="checkbox"><span><\/span><\/label><div><p>([^<]*)<\/p><\/div><\/li>/g,
		'<li class="task-list-item"><input type="checkbox" disabled> $1</li>'
	);

	return result;
};

export const markdownToHtml = async (markdown: string): Promise<string> => {
	const file = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(markdown);
	return rehypeToTiptap(String(file));
}

export const formatMarkdown = async (markdown: string): Promise<string> => {
	const file = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.use(remarkStringify)
		.process(markdown);
	return String(file);
}

export const htmlToMarkdown = async (html: string): Promise<string> => {
	const file = await unified()
		.use(rehypeParse)
		.use(rehypeRemark)
		.use(remarkGfm)
		.use(remarkStringify)
		.process(tiptapToRehype(html));
	return String(file);
}

export const base64ToBinary = (base64: string): Uint8Array => {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

export const getContentTypeFromDataUri = (dataUri: string): string => {
	const match = dataUri.match(/^data:([^;]+);/);
	return match ? match[1] : 'application/octet-stream';
}


