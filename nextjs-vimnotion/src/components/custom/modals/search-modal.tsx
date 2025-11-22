import { debounce } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { SearchResults } from "@/types/search-types";

const renderPathWithHighlights = (path: string, matches: RegExpMatchArray | null) => {
	if (!matches || matches.length === 0) return path;
	const parts: (string | ReactNode)[] = [];
	let lastIndex = 0;
	matches.forEach((match, idx) => {
		const matchIndex = path.indexOf(match, lastIndex);
		if (matchIndex > lastIndex) {
			parts.push(path.substring(lastIndex, matchIndex));
		}
		parts.push(
			<span key={`match-${idx}`} className="text-orange-400 font-bold">
				{match}
			</span>
		);
		lastIndex = matchIndex + match.length;
	});

	if (lastIndex < path.length) {
		parts.push(path.substring(lastIndex));
	}

	return parts;
};

export const SearchModal = () => {
	const [inputMode, setInputMode] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchResults, setSearchResults] = useState<SearchResults>({});
	const { refreshFilePaths, openFileInBuffer, searchByFilename,
		toggleSearchModal } = useEditorStore((state) => state);
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
		debouncedSearch(searchTerm);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (inputModeRef.current) {
					setInputMode(false);
				} else {
					toggleSearchModal();
				}
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

		const handleIKeyDown = (event: KeyboardEvent) => {
			if (!inputModeRef.current && event.key === 'i') {
				event.preventDefault();
				event.stopImmediatePropagation();
				setInputMode(true);
			}
		};
		document.addEventListener('keydown', handleIKeyDown);

		const handleCrKeyDown = (event: KeyboardEvent) => {
			if (!inputModeRef.current && event.key === 'Enter') {
				openFileInBuffer(searchResultsRef.current[Object.keys(searchResultsRef.current)[selectedIndexRef.current]].id);
				toggleSearchModal();
			}
		};
		document.addEventListener('keydown', handleCrKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleJKeyDown);
			document.removeEventListener('keydown', handleKKeyDown);
			document.removeEventListener('keydown', handleIKeyDown);
			document.removeEventListener('keydown', handleCrKeyDown);
		}

	}, []);

	useEffect(() => {
		if (inputMode) {
			const inp = window.document.getElementById("search-modal-input");
			inp?.focus();
		}
	}, [inputMode]);

	return (
		<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 h-[600px] max-h-11/12 max-w-11/12 w-[700px] pt-14 p-4 
			flex flex-col items-center bg-background">
			<div className="h-full w-full flex flex-col justify-between">
				<div className="w-full outline-offset-2 outline outline-foreground-muted/50 
					p-3 grow mb-4">
					{Object.keys(searchResults).map((path, i) => {
						return (
							<div key={searchResults[path].id}
								className={`${!inputMode && selectedIndex === i ?
									"rounded-sm bg-foreground/10 " : ""}
									py-0.5 px-1 flex`}>
								{renderPathWithHighlights(path, searchResults[path].regexMatches)}
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
