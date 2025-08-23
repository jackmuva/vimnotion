import { useRef, useState, useEffect } from "react";
import { VimEditor } from "./vim-editor";
import { v4 } from "uuid";
import { useStore } from "@/store/store";

enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

type PaneNode = {
	[id: string]: {
		children: Array<string>,
		state: SplitState
	}
}

export const EditorContainer = ({
	toggleSidebar,
	toggleLeaderPanel
}: {
	toggleSidebar: () => void,
	toggleLeaderPanel: () => void
}) => {
	const rootId = useRef<string | null>(null);
	const [isClient, setIsClient] = useState(false);
	const activePane = useStore((state) => state.activePane);
	const updateActivePane = useStore((state) => state.updateActivePane);
	const [paneTree, setPaneTree] = useState<PaneNode>({});
	const [parentMap, setParentMap] = useState<any>({});

	useEffect(() => {
		if (!rootId.current) {
			rootId.current = "root";
			setPaneTree({
				[rootId.current]: {
					state: SplitState.NONE,
					children: [],
				}
			});
		}
		setIsClient(true);
	}, []);


	console.log(paneTree);
	console.log(parentMap);

	const splitVertical = () => {
		const childOneId = v4();
		const childTwoId = v4();
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: activePane,
			[childTwoId]: activePane,
		}));
		setPaneTree((prev: PaneNode) => ({
			...prev,
			[activePane]: {
				state: SplitState.VERTICAL,
				children: [...prev[activePane].children, childOneId, childTwoId]
			},
			[childOneId]: {
				state: SplitState.NONE,
				children: [],
			},
			[childTwoId]: {
				state: SplitState.NONE,
				children: [],
			}
		}));
		updateActivePane(childTwoId);
	}

	const splitHorizontal = () => {
		const childOneId = v4();
		const childTwoId = v4();
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: activePane,
			[childTwoId]: activePane,
		}));
		setPaneTree((prev: any) => ({
			...prev,
			[activePane]: {
				state: SplitState.HORIZONTAL,
				children: [...prev[activePane].children, childOneId, childTwoId]
			},
			[childOneId]: {
				state: SplitState.NONE,
				children: [],
			},
			[childTwoId]: {
				state: SplitState.NONE,
				children: [],
			}
		}));
		updateActivePane(childTwoId);
	}

	const closePane = () => {
		const parentId = parentMap[activePane];
		const newTree = { ...paneTree };
		const newMap = { ...parentMap };

		delete newTree[activePane];

		const parentNode = { ...newTree[parentId] };
		parentNode.children = parentNode.children.filter(childId => childId !== activePane);
		newTree[parentId] = parentNode;

		setPaneTree(newTree);
		setParentMap(newMap);
	}

	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE) {
			return (
				<div key={paneId} className="h-full w-full">
					<EditorPane paneId={paneId}
						toggleSidebar={toggleSidebar}
						splitHorizontal={() => splitHorizontal()}
						splitVertical={() => splitVertical()}
						closePane={() => closePane()}
						toggleLeaderPanel={toggleLeaderPanel} />
				</div>

			);
		}
		return (
			<div key={paneId} className={`h-full w-full flex 
				${paneTree[paneId].state === SplitState.HORIZONTAL ?
					"flex-col" : ""}`}>
				{paneTree[paneId].children.map((childId) => {
					return hydratePanes(childId)
				})}
			</div>
		)
	}

	if (!isClient || !rootId.current) {
		return <div className="h-full w-full">Loading...</div>;
	} else {
		return (
			<>
				{hydratePanes(rootId.current)}
			</>
		);
	}
}

const EditorPane = ({
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
