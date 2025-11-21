import { debounce } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

export const SearchModal = () => {
	const [inputMode, setInputMode] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchResults, setSearchResults] = useState<SearchResults>({});
	const { refreshFilePaths, openFileInBuffer, searchByFilename } = useEditorStore((state) => state);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	const selectedIndexRef = useRef(selectedIndex);
	const searchResultsRef = useRef(searchResults);
	const inputModeRef = useRef(inputMode);

	const debouncedSearch = useCallback(debounce((term: string) => {
		const searchRes: SearchResults = searchByFilename(term);
		setSearchResults(searchRes);
	}, 0), [searchByFilename]);

	useEffect(() => {
		selectedIndexRef.current = selectedIndex;
	}, [selectedIndex]);

	useEffect(() => {
		searchResultsRef.current = searchResults;
	}, [searchResults]);

	useEffect(() => {
		inputModeRef.current = inputMode;
	}, [inputMode]);

	useEffect(() => {
		refreshFilePaths();
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setInputMode((prev) => !prev);
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleJKeyDown = (event: KeyboardEvent) => {
			if (!inputModeRef.current && event.key === 'j') {
				if (selectedIndexRef.current < Object.keys(searchResultsRef.current).length - 1) {
					setSelectedIndex(selectedIndexRef.current + 1);
				}
			}
		};
		document.addEventListener('keydown', handleJKeyDown);

		const handleKKeyDown = (event: KeyboardEvent) => {
			if (!inputModeRef.current && event.key === 'k') {
				if (selectedIndexRef.current > 0) {
					setSelectedIndex(selectedIndexRef.current - 1);
				}
			}
		};
		document.addEventListener('keydown', handleKKeyDown);


		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleJKeyDown);
			document.removeEventListener('keydown', handleKKeyDown);
		}

	}, []);

	useEffect(() => {
		if (inputMode) {
			const inp = window.document.getElementById("search-modal-input");
			inp?.focus();
		}
	}, [inputMode]);

	console.log("search res: ", searchResults);
	console.log("index: ", selectedIndex);

	return (
		<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 h-[600px] max-h-11/12 max-w-11/12 w-[700px] pt-14 p-4 
			flex flex-col items-center bg-background">
			<div className="h-full w-full flex flex-col justify-between">
				<div className="w-full outline-offset-2 outline outline-foreground-muted/50 
					p-3 grow mb-4">
					{Object.keys(searchResults).map((path) => {
						return (
							<div key={searchResults[path].id}>
								{path}
							</div>
						);
					})}
				</div>
				<input type="text" className="w-full outline outline-offset-2 outline-foreground-muted/50 
					bg-foreground-muted/10 px-1 py-0.5"
					id="search-modal-input"
					value={searchTerm}
					disabled={!inputMode}
					onChange={(e: ChangeEvent<HTMLInputElement>) => {
						setSearchTerm(e.target.value)
						debouncedSearch(e.target.value)
					}} />
			</div>
		</div >
	);
}
