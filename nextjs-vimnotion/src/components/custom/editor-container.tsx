import { useRef, useState } from "react";
import { VimEditor } from "./vim-editor";
import { v4 } from "uuid";

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

export const EditorContainer = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
	const rootId = useRef(v4());
	const [paneTree, setPaneTree] = useState<PaneNode>({
		[rootId.current]: {
			state: SplitState.NONE,
			children: [],
		}
	});
	const [parentMap, setParentMap] = useState<any>({});

	console.log(paneTree);
	console.log(parentMap);

	const splitVertical = (paneId: string) => {
		const childOneId = v4();
		const childTwoId = v4();
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: paneId,
			[childTwoId]: paneId,
		}));
		setPaneTree((prev: PaneNode) => ({
			...prev,
			[paneId]: {
				state: SplitState.VERTICAL,
				children: [...prev[paneId].children, childOneId, childTwoId]
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
	}

	const splitHorizontal = (paneId: string) => {
		const childOneId = v4();
		const childTwoId = v4();
		setParentMap((prev: any) => ({
			...prev,
			[childOneId]: paneId,
			[childTwoId]: paneId,
		}));
		setPaneTree((prev: any) => ({
			...prev,
			[paneId]: {
				state: SplitState.HORIZONTAL,
				children: [...prev[paneId].children, childOneId, childTwoId]
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
	}

	const closePane = (paneId: string) => {
		const parentId = parentMap[paneId];
		const newTree = { ...paneTree };
		const newMap = { ...parentMap };

		delete newTree[paneId];

		const parentNode = { ...newTree[parentId] };
		parentNode.children = parentNode.children.filter(childId => childId !== paneId);
		newTree[parentId] = parentNode;

		delete newMap[paneId];

		setPaneTree(newTree);
		setParentMap(newMap);
	}

	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE) {
			return (
				<div id={paneId} className="border h-full w-full">
					<EditorPane toggleSidebar={toggleSidebar}
						splitHorizontal={() => splitHorizontal(paneId)}
						splitVertical={() => splitVertical(paneId)}
						closePane={() => closePane(paneId)} />
				</div>

			);
		}
		return (
			<div id={paneId} className={`h-full w-full flex 
				${paneTree[paneId].state === SplitState.HORIZONTAL ?
					"flex-col" : ""}`}>
				{paneTree[paneId].children.map((childId) => {
					return hydratePanes(childId)
				})}
			</div>
		)
	}

	return (
		<>
			{hydratePanes(rootId.current)}
		</>
	);
}

const EditorPane = ({ toggleSidebar, splitHorizontal, splitVertical, closePane }: {
	toggleSidebar: () => void,
	splitHorizontal: () => void,
	splitVertical: () => void,
	closePane: () => void,
}) => {


	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex space-x-2">
				<button onClick={splitVertical}>vertical</button>
				<button onClick={splitHorizontal}>horizontal</button>
				<button onClick={closePane}>close</button>
			</div>
			<div>
				<VimEditor toggleSidebar={toggleSidebar} />
			</div>
		</div>
	);
}
