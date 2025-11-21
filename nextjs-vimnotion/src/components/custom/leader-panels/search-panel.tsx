import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";

export const SearchPanel = () => {
	const { toggleSearchModal, toggleSearchPanel } = useEditorStore((state) => state);
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleSearchPanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleFKey = (event: KeyboardEvent) => {
			if (event.key === 'f') {
				toggleSearchModal();
				toggleSearchPanel();
			}
		};
		document.addEventListener('keydown', handleFKey);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleFKey);
		}

	}, [])
	return (
		<div id={`search-panel`}
			className='z-20 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
			<div>
				<button id={`first-search-option`}
					className="cursor-pointer"
					onClick={() => {
						toggleSearchModal();
						toggleSearchPanel();
					}}>
					[f]
				</button>ilename
			</div>
		</div>
	);
}
