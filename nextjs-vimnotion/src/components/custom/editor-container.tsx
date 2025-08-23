import { useRef, useState, useEffect } from "react";
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
	const rootId = useRef<string | null>(null);
	const [isClient, setIsClient] = useState(false);

	// Initialize rootId only on client side to avoid hydration mismatch
	useEffect(() => {
		if (!rootId.current) {
			rootId.current = v4();
			setPaneTree({
				[rootId.current]: {
					state: SplitState.NONE,
					children: [],
				}
			});
		}
		setIsClient(true);
	}, []);
	const [paneTree, setPaneTree] = useState<PaneNode>({});
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
		for (const childId of parentNode.children) {
			delete newTree[childId];
			delete newMap[childId];
		}
		parentNode.children = [];
		parentNode.state = SplitState.NONE;
		newTree[parentId] = parentNode;

		setPaneTree(newTree);
		setParentMap(newMap);
	}

	const hydratePanes = (paneId: string) => {
		if (paneTree[paneId].state === SplitState.NONE) {
			return (
				<div key={paneId} className="border h-full w-full">
					<EditorPane toggleSidebar={toggleSidebar}
						splitHorizontal={() => splitHorizontal(paneId)}
						splitVertical={() => splitVertical(paneId)}
						closePane={() => closePane(paneId)} />
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
		return <div className="h-full w-full border">Loading...</div>;
	}else{
	return (
		<>
			{hydratePanes(rootId.current)}
		</>
	);
	}
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
