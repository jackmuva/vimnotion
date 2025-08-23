import { useRef, useState } from "react";
import { VimEditor } from "./vim-editor";
import { v4 } from "uuid";

export const EditorContainer = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
	const rootId = useRef(v4());
	const [paneTree, setPaneTree] = useState<any>({
		[rootId.current]: {
			vertChildren: [],
			horizChildren: [],
		}
	});
	console.log(paneTree);

	const splitVertical = (paneId: string) => {
		const pane = document.getElementById(paneId);
		const childOneId = v4();
		const childTwoId = v4();
		if (pane) {
			pane.outerHTML = `
				<div id={${paneId}} className="h-full w-full flex">
					<div id={${childOneId}} className="h-full">
						<EditorPane toggleSidebar={${toggleSidebar}}
							splitHorizontal={${() => splitHorizontal(childOneId)}}
							splitVertical={${() => splitVertical(childOneId)}} />
					</div>
					<div id={${childTwoId}} className="h-full">
						<EditorPane toggleSidebar={${toggleSidebar}}
							splitHorizontal={${() => splitHorizontal(childTwoId)}}
							splitVertical={${() => splitVertical(childTwoId)}} />
					</div>
				</div>
			`
		}
		setPaneTree((prev: any) => ({
			...prev,
			[paneId]: {
				...prev[paneId],
				vertChildren: [...prev[paneId].vertChildren, childOneId, childTwoId]
			},
			[childOneId]: {
				vertChildren: [],
				horizChildren: [],
			},
			[childTwoId]: {
				vertChildren: [],
				horizChildren: [],
			}
		}));
	}

	const splitHorizontal = (paneId: string) => {
		const pane = document.getElementById(paneId);
		const childOneId = v4();
		const childTwoId = v4();
		if (pane) {
			pane.innerHTML = `
				<div id={${paneId}} className="h-full w-full flex flex-col">
					<div id={${childOneId}} className="w-full">
						<EditorPane toggleSidebar={${toggleSidebar}}
							splitHorizontal={${() => splitHorizontal(childOneId)}}
							splitVertical={${() => splitVertical(childOneId)}} />
					</div>
					<div id={${childTwoId}} className="w-full">
						<EditorPane toggleSidebar={toggleSidebar}
							splitHorizontal={${() => splitHorizontal(childTwoId)}}
							splitVertical={${() => splitVertical(childTwoId)}} />
					</div>
				</div>
			`
		}
		setPaneTree((prev: any) => ({
			...prev,
			[paneId]: {
				...prev[paneId],
				horizChildren: [...prev[paneId].vertChildren, childOneId, childTwoId]
			},
			[childOneId]: {
				vertChildren: [],
				horizChildren: [],
			},
			[childTwoId]: {
				vertChildren: [],
				horizChildren: [],
			}
		}));
	}


	return (
		<>
			<div id={rootId.current} className="h-full w-full">
				<EditorPane toggleSidebar={toggleSidebar}
					splitHorizontal={() => splitHorizontal(rootId.current)}
					splitVertical={() => splitVertical(rootId.current)} />
			</div>
		</>
	);
}

enum SplitState {
	NONE = "NONE",
	HORIZONTAL = "HORIZONTAL",
	VERTICAL = "VERTICAL",
}

const EditorPane = ({ toggleSidebar, splitHorizontal, splitVertical }: {
	toggleSidebar: () => void,
	splitHorizontal: () => void,
	splitVertical: () => void,
}) => {

	const closePane = () => {

	}

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
