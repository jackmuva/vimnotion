import { EditorType, PaneNode } from "@/types/editor-types";
import { VimEditor } from "./editors/vim-editor";
import { useEditorStore } from "@/store/editor-store";
import { MarkdownEditor } from "./editors/markdown-editor";
import { AgentEditor } from "./editors/agent-editor";

export const EditorPane = ({
	paneId,
	toggleSidebar,
	toggleLeaderPanel
}: {
	paneId: string,
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void,
}) => {
	const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
	const pane: PaneNode = getPane(paneId);

	return (
		<div className="h-full w-full flex flex-col p-1">
			{pane[paneId].editorType === EditorType.VIM ? (
				<VimEditor paneId={paneId}
					toggleSidebar={toggleSidebar}
					toggleLeaderPanel={toggleLeaderPanel} />
			) : (
				pane[paneId].editorType === EditorType.MARKDOWN ? (
					<MarkdownEditor paneId={paneId} />
				) : (
					<AgentEditor paneId={paneId} />
				)
			)}
		</div >
	);
}
