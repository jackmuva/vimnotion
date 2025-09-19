export const MarkdownEditor = ({
	paneId
}: {
	paneId: string,
}) => {
	return (
		<div className='relative h-full w-full rounded-sm z-20 bg-background'>
			<div id={`md-editor-${paneId}`}
				className={`h-full w-full overflow-y-scroll`}>
				hi im markdown
			</div>
		</div>
	);
}
