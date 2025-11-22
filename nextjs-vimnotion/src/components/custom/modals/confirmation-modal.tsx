import { useEditorStore } from "@/store/editor-store";
import { DirectoryChanges, DirectoryTree } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export const ConfirmationModal = () => {
	const { setDirectoryConfirmation, toggleSidebar,
		detectAllDirectoryChanges, setDirectoryState, proposedDirectoryState } = useEditorStore((state) => state);
	const [changes, setChanges] = useState<DirectoryChanges>({
		created: [],
		deleted: [],
		moved: [],
	});

	const updateDirectoryStructure = async (changes: DirectoryChanges, structure: DirectoryTree): Promise<boolean> => {
		console.log("sending changes: ", changes);
		const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/directory`, {
			method: "PUT",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				changes: changes,
				structure: JSON.stringify(structure)
			}),
			credentials: "include",
		});
		console.log(await res.json());
		return res.ok;
	}

	useEffect(() => {
		const newChanges: DirectoryChanges = detectAllDirectoryChanges();
		if (newChanges.created.length === 0 && newChanges.deleted.length === 0 && newChanges.moved.length === 0) {
			setDirectoryConfirmation(false);
		} else {
			setChanges(newChanges);
		}
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setDirectoryConfirmation(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleNKey = (event: KeyboardEvent) => {
			if (event.key === 'n') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSidebar();
				setDirectoryConfirmation(false);
			}
		};
		document.addEventListener('keydown', handleNKey);

		const handleYKey = async (event: KeyboardEvent) => {
			if (event.key === 'y') {
				event.preventDefault();
				event.stopImmediatePropagation();
				const updateRes: boolean = await updateDirectoryStructure(changes, proposedDirectoryState);
				if (updateRes) {
					setDirectoryState(structuredClone(proposedDirectoryState));
					setDirectoryConfirmation(false);
					toggleSidebar();
				}
			}
		};
		document.addEventListener('keydown', handleYKey);


		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleNKey);
			document.removeEventListener('keydown', handleYKey);
		};
	}, [setDirectoryConfirmation, changes, proposedDirectoryState, toggleSidebar, setDirectoryState]);

	return (
		<div className="font-pixel text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 bg-background h-96 max-w-11/12 w-[700px] p-4 
			flex flex-col justify-between outline  outline-offset-2 
			outline-foreground-muted/50">
			<div className="w-full flex flex-col">
				{changes.created.map((newObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-blue-500 font-bold italic">create</div>
							<div>{newObj.objectLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}
				{changes.moved.map((movedObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-yellow-600 font-bold italic">moved</div>
							<div>{movedObj.oldLocation.split("||").map((str) => str.split("|")[1]).join("")}
								{" -> "}
								{movedObj.newLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}
				{changes.deleted.map((oldObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-red-500 font-bold italic">delete</div>
							<div>{oldObj.objectLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}

			</div>
			<div className="w-full flex gap-8 justify-center text-2xl">
				<div>
					<button id={`first-confirmation-option`}
						className="cursor-pointer"
						onClick={async () => {
							const updateRes: boolean = await updateDirectoryStructure(changes, proposedDirectoryState);
							if (updateRes) {
								setDirectoryState(structuredClone(proposedDirectoryState));
								setDirectoryConfirmation(false);
								toggleSidebar();
							}
						}}>
						<span className="font-bold text-orange-500">[y]</span>
					</button>es
				</div>
				<div>
					<button
						className="cursor-pointer"
						onClick={() => {
							setDirectoryConfirmation(false);
							toggleSidebar();
						}}>
						<span className="font-bold text-orange-500">[n]</span>
					</button>o
				</div>
			</div>
		</div>
	);
}
