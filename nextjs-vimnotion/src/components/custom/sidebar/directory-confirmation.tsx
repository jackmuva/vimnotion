import { useEditorStore } from "@/store/editor-store";
import { DirectoryChanges } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export const DirectoryConfirmation = () => {
	const { setDirectoryConfirmation, toggleSidebar,
		detectAllDirectoryChanges, setDirectoryState, proposedDirectoryState } = useEditorStore((state) => state);
	const [changes, setChanges] = useState<DirectoryChanges>({
		created: [],
		deleted: [],
		moved: [],
	});

	useEffect(() => {
		const newChanges: DirectoryChanges = detectAllDirectoryChanges();
		if (newChanges.created.length === 0 && newChanges.deleted.length === 0 && newChanges.moved.length === 0) {
			console.log("firing no new changes");
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

		const handleYKey = (event: KeyboardEvent) => {
			if (event.key === 'y') {
				event.preventDefault();
				event.stopImmediatePropagation();
				setDirectoryState(structuredClone(proposedDirectoryState));
				setDirectoryConfirmation(false);
				toggleSidebar();
			}
		};
		document.addEventListener('keydown', handleYKey);


		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleNKey);
			document.removeEventListener('keydown', handleYKey);
		};
	}, [setDirectoryConfirmation]);


	return (
		<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 bg-secondary-background shadow-2xl h-96 max-w-11/12 w-[700px] p-4 
			flex flex-col justify-between">
			<div className="w-full flex flex-col">
				{changes.created.map((newObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-blue-500">CREATE</div>
							<div>{newObj.objectLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}
				{changes.moved.map((movedObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-yellow-500">MOVED</div>
							<div>{movedObj.oldLocation.split("||").map((str) => str.split("|")[1]).join("")}
								{" -> "}
								{movedObj.newLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}
				{changes.deleted.map((oldObj, i) => {
					return (
						<div className="flex gap-4" key={i}>
							<div className="text-red-500">DELETE</div>
							<div>{oldObj.objectLocation.split("||").map((str) => str.split("|")[1]).join("")}</div>
						</div>
					);
				})}

			</div>
			<div className="w-full flex gap-8 justify-center">
				<div>
					<button id={`first-confirmation-option`}
						className="cursor-pointer"
						onClick={() => {
							setDirectoryState(structuredClone(proposedDirectoryState));
							setDirectoryConfirmation(false);
							toggleSidebar();
						}}>
						[y]
					</button>es
				</div>
				<div>
					<button
						className="cursor-pointer"
						onClick={() => {
							setDirectoryConfirmation(false);
							toggleSidebar();
						}}>
						[n]
					</button>o
				</div>
			</div>
		</div>
	);
}
