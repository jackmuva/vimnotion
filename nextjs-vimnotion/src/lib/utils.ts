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
//NOTE: <ul class="contains-task-list" data-type="taskList"><li class="task-list-item" data-checked="false"><label contenteditable="false"><input aria-label="task incomplete" type="checkbox"><span></span></label><div><p>hi</p></div></li></ul>
//<ul class="contains-task-list" data-type="taskList"><li class="task-list-item" data-checked="true"><label contenteditable="false"><input aria-label="task completed" type="checkbox"><span></span></label><div><p>hi</p></div></li></ul>
//
//NOTE:<ul class="contains-task-list">
// <li class="task-list-item"><input type="checkbox" disabled> hi</li>
// </ul>
//
export const rehypeToTiptap = (html: string): string => {
	const result = html.replaceAll("<ul class=\"contains-task-list\">", "<ul class=\"contains-task-list\" data-type=\"taskList\">");
	return result;
};

export const tiptapToRehype = (html: string): string => {
	const result = html;
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
	return (String(file));
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
		.process(html);
	return (String(file));
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


