'use client';
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import { DirectoryTree, SidebarData } from "@/types/sidebar-types";
import { useEffect } from "react";
import { LeaderPanel } from "@/components/leader-panels/leader-panel";
import { WindowPanel } from "@/components/leader-panels/window-panel";
import { TabContainer } from "@/components/tab-container";
import { useEditorStore } from "@/store/editor-store";
import { LeaderButton } from "@/components/leader-button";
import useSWR from "swr";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { SearchPanel } from "@/components/leader-panels/search-panel";
import { SearchModal } from "@/components/modals/search-modal";
import { ImageModal } from "@/components/modals/image-modal";
import { PublishModal } from "@/components/modals/publish-modal";
import { AiPanel } from "./leader-panels/ai-panel";
import { AiModal } from "./modals/ascii-modal";
import { getDirectory } from "@/services/api-service";

export default function VimNotion() {
	const leaderPanel = useEditorStore((state) => state.openLeaderPanel);
	const windowPanel = useEditorStore((state) => state.openWindowPanel);
	const searchPanel = useEditorStore((state) => state.openSearchPanel);
	const aiPanel = useEditorStore((state) => state.openAiPanel);
	const asciiModal = useEditorStore((state) => state.openAsciiModal);
	const searchModal = useEditorStore((state) => state.searchModal);
	const imageModal = useEditorStore((state) => state.openImageModal);
	const publishModal = useEditorStore((state) => state.openPublishModal);
	const { openSidebar, directoryConfirmation, setDirectoryState,
		setProposedDirectoryState, setLocation, } = useEditorStore((state) => state);


	useEffect(() => {
		if (leaderPanel) {
			const button = document.getElementById(`first-leader-option`);
			if (button) {
				button.focus();
			}
		}
	}, [leaderPanel]);

	useEffect(() => {
		if (windowPanel) {
			const button = document.getElementById(`first-window-option`);
			if (button) {
				button.focus();
			}
		}
	}, [windowPanel]);

	useEffect(() => {
		if (searchPanel) {
			const button = document.getElementById(`first-search-option`);
			if (button) {
				button.focus();
			}
		}
	}, [searchPanel]);

	useEffect(() => {
		if (aiPanel) {
			const button = document.getElementById(`first-ai-option`);
			if (button) {
				button.focus();
			}
		}
	}, [aiPanel]);

	useEffect(() => {
		if (directoryConfirmation) {
			const button = document.getElementById(`first-confirmation-option`);
			if (button) {
				button.focus();
			}
		}
	}, [directoryConfirmation]);

	useEffect(() => {
		if (searchModal) {
			const input = document.getElementById(`search-modal-input`);
			if (input) {
				input.focus();
			}
		}
	}, [searchModal]);

	useEffect(() => {
		if (imageModal) {
			const input = document.getElementById(`first-image-option`);
			if (input) {
				input.focus();
			}
		}
	}, [imageModal]);

	useEffect(() => {
		if (publishModal) {
			const input = document.getElementById(`first-publish-option`);
			if (input) {
				input.focus();
			}
		}
	}, [publishModal]);

	useEffect(() => {
		if (asciiModal) {
			const input = document.getElementById(`ai-modal-input`);
			if (input) {
				input.focus();
			}
		}
	}, [asciiModal]);


	const { data, isLoading } = useSWR<SidebarData>(`/api/directory`, async () => {
		const directory = await getDirectory();
		return directory;
	});

	useEffect(() => {
		if (data && data.StatusCode === 200) {
			const directory: DirectoryTree = JSON.parse(data.Data!);
			setDirectoryState(directory);
			setProposedDirectoryState(structuredClone(directory));
			setLocation(Object.keys(directory)[0]);
		}
	}, [data]);

	return (
		<div className="bg-background w-dvw h-dvh flex justify-center items-center pt-14 px-4 font-robo-slab text-base">
			<Header />
			{openSidebar && <Sidebar sidebarData={data} sidebarDataIsLoading={isLoading} />}
			<TabContainer />
			{leaderPanel && <LeaderPanel />}
			{windowPanel && <WindowPanel />}
			{searchPanel && <SearchPanel />}
			{aiPanel && <AiPanel />}
			<LeaderButton />
			{directoryConfirmation && <ConfirmationModal />}
			{searchModal && <SearchModal />}
			{imageModal && <ImageModal />}
			{publishModal && <PublishModal />}
			{asciiModal && <AiModal />}
		</div>
	);
}
