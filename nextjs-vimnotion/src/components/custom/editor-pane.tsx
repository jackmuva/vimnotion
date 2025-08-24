import { VimEditor } from "./vim-editor";

export const EditorPane = ({
	paneId,
	toggleSidebar,
	splitHorizontal,
	splitVertical,
	closePane,
	toggleLeaderPanel
}: {
	paneId: string,
	toggleSidebar: () => void,
	splitHorizontal: () => void,
	splitVertical: () => void,
	closePane: () => void,
	toggleLeaderPanel: () => void,
}) => {


	return (
		<div className="h-full w-full flex flex-col p-1">
			<VimEditor paneId={paneId}
				toggleSidebar={toggleSidebar}
				toggleLeaderPanel={toggleLeaderPanel}
				splitVertical={splitVertical}
				splitHorizontal={splitHorizontal}
				closePane={closePane}
			/>
		</div>
	);
}
