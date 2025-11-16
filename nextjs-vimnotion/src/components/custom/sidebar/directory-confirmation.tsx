import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";

export const DirectoryConfirmation = () => {
	const { setDirectoryConfirmation, proposedDirectoryState, directoryState,
		toggleSidebar } = useEditorStore((state) => state);

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
				setDirectoryConfirmation(false);
			}
		};
		document.addEventListener('keydown', handleNKey);

		const handleYKey = (event: KeyboardEvent) => {
			if (event.key === 'y') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSidebar();
				setDirectoryConfirmation(false);
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
			<div className="w-full">

			</div>
			<div className="w-full flex gap-8 justify-center">
				<div>
					<button id={`first-confirmation-option`}
						className="cursor-pointer"
						onClick={() => {
						}}>
						[y]
					</button>es
				</div>
				<div>
					<button
						className="cursor-pointer"
						onClick={() => {
							setDirectoryConfirmation(false);
						}}>
						[n]
					</button>o
				</div>
			</div>
		</div>
	);
}
