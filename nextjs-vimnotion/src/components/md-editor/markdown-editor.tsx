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
		const links = document.getElementsByTagName('a');
		for (const link of links) {
			link.setAttribute('target', '_blank');
		}
	}, [pane[paneId].buffer])

	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-background 
			flex flex-col justify-start items-center space-y-2 p-2'>
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
