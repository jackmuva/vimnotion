import { useEditorStore } from "@/store/editor-store";
import { SearchType } from "@/types/search-types";
import { useEffect } from "react";

export const SearchPanel = () => {
	const { setSearchModal, toggleSearchPanel } = useEditorStore((state) => state);
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleSearchPanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleFKey = (event: KeyboardEvent) => {
			if (event.key === 'f') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSearchPanel();
				setSearchModal(SearchType.FILENAME);
			}
		};
		document.addEventListener('keydown', handleFKey);

		const handleGKey = (event: KeyboardEvent) => {
			if (event.key === 'g') {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleSearchPanel();
				setSearchModal(SearchType.GREP);
			}
		};
		document.addEventListener('keydown', handleGKey);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleFKey);
			document.removeEventListener('keydown', handleGKey);
		}

	}, [])
	return (
		<div id={`search-panel`}
			className='font-robo-mono text-xl z-20 w-full bg-background-muted h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28 content-start gap-4'>
			<div>
				<button id={`first-search-option`}
					className="cursor-pointer"
					onClick={() => {
						setSearchModal(SearchType.FILENAME);
						toggleSearchPanel();
					}}>
					<span className="font-bold text-orange-500">[f]</span>
				</button>ilename
			</div>
			<div>
				<button className="cursor-pointer"
					onClick={() => {
						setSearchModal(SearchType.GREP);
						toggleSearchPanel();
					}}>
					<span className="font-bold text-orange-500">[g]</span>
				</button>rep
			</div>

		</div>
	);
}
