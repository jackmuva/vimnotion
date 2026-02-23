import { useEditorStore } from "@/store/editor-store";
import { EditorType, PaneNode } from "@/types/editor-types";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { gruvboxDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export const MarkdownEditor = ({
	paneId
}: {
	paneId: string,
}) => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const updatePane: (pane: PaneNode) => void = useEditorStore((state) => state.updatePane);
	const pane: PaneNode = getPane(paneId);
	const activePane: string = useEditorStore((state) => state.activePane);
	const { toggleLeaderPanel } = useEditorStore((state) => state);
	const toggleSidebar = useEditorStore((state) => state.toggleSidebar);

	const shiftToVim = (): void => {
		const updateNode: PaneNode = {
			[paneId]: {
				...pane[paneId],
				editorType: EditorType.VIM,
			},
		};
		updatePane(updateNode);
	}

	useEffect(() => {
		const mdElement = document.getElementById(`md-editor-${paneId}`);
		if (!mdElement) return;

		const buffer = pane[paneId].buffer;
		const cursorPos = pane[paneId].cursorPosition;
		const textBeforeCursor = buffer.slice(0, cursorPos);
		const cursorLine = textBeforeCursor.split('\n').length;

		const elementsWithLine = mdElement.querySelectorAll('[data-source-line]');
		let closestElement: Element | null = null;
		let closestLine = 0;

		elementsWithLine.forEach((el) => {
			const line = parseInt(el.getAttribute('data-source-line') || '0', 10);
			if (line <= cursorLine && line > closestLine) {
				closestLine = line;
				closestElement = el;
			}
		});

		if (closestElement !== null) {
			(closestElement as Element).scrollIntoView({ block: 'center', behavior: 'instant' });
		}

		const handleSpaceKey = (event: KeyboardEvent) => {
			if (event.key === ' ') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleLeaderPanel();
			}
		};
		document.addEventListener('keydown', handleSpaceKey);

		const handleDashKey = (event: KeyboardEvent) => {
			if (event.key === '-') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSidebar()
			}
		};
		document.addEventListener('keydown', handleDashKey);


		return () => {
			document.removeEventListener('keydown', handleSpaceKey);
			document.removeEventListener('keydown', handleDashKey);
		}
	}, [toggleLeaderPanel]);

	return (
		<div className={`${activePane === paneId ? "outline-2 outline-offset-2 outline-indigo-300/70 dark:outline-indigo-300/30" : ""} relative h-full w-full 
				z-20 bg-background flex flex-col justify-start items-center space-y-2 p-2`}>
			<h1 className="flex justify-end w-full italic  
				border-b border-b-background-muted/50">
				<button className="flex items-center space-x-1 
					hover:bg-background-muted/50 p-1 cursor-pointer rounded-sm"
					onClick={() => shiftToVim()}>
					<Loader size={15} />
					<div className="text-sm">vim-mode</div>
				</button>
			</h1>
			<div id={`md-editor-${paneId}`}
				className={`no-scrollbar h-full max-w-[1100px] w-full overflow-y-scroll`}>
				<Markdown remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
					components={{
						a({ node, children, ...props }: any) {
							return <a target="_blank" {...props}>{children}</a>;
						},
						p({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <p data-source-line={line} {...props}>{children}</p>;
						},
						h1({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h1 data-source-line={line} {...props}>{children}</h1>;
						},
						h2({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h2 data-source-line={line} {...props}>{children}</h2>;
						},
						h3({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h3 data-source-line={line} {...props}>{children}</h3>;
						},
						h4({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h4 data-source-line={line} {...props}>{children}</h4>;
						},
						h5({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h5 data-source-line={line} {...props}>{children}</h5>;
						},
						h6({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <h6 data-source-line={line} {...props}>{children}</h6>;
						},
						li({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <li data-source-line={line} {...props}>{children}</li>;
						},
						blockquote({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <blockquote data-source-line={line} {...props}>{children}</blockquote>;
						},
						img({ node, src, alt, ...props }: any) {
							const line = node?.position?.start?.line;
							return <img data-source-line={line} src={src} alt={alt} {...props} />;
						},
						pre({ node, children, ...props }: any) {
							const line = node?.position?.start?.line;
							return <pre data-source-line={line} {...props}>{children}</pre>;
						},
						code({ node, inline, className, children, ...props }: any) {
							const match = /language-(\w+)/.exec(className || '');

							return !inline && match ? (
								<SyntaxHighlighter style={gruvboxDark} PreTag="div" language={match[1]} {...props}>
									{String(children).replace(/\n$/, '')}
								</SyntaxHighlighter>
							) : (
								<code className={className} {...props}>
									{children}
								</code>
							);
						},
					}}
				>
					{pane[paneId].buffer}
				</Markdown>
			</div>
		</div>
	);
}
