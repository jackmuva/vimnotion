import { VimEditor } from "./vim-editor/vim-editor";

export const EditorPane = ({
	paneId,
	toggleSidebar,
	toggleLeaderPanel
}: {
	paneId: string,
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void,
}) => {


	return (
		<div className="h-full w-full flex flex-col p-1">
			<VimEditor paneId={paneId}
				toggleSidebar={toggleSidebar}
				toggleLeaderPanel={toggleLeaderPanel}
			/>
		</div>
	);
}
