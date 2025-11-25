'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar/sidebar";
import { DirectoryTree, SidebarData } from "@/types/sidebar-types";
import { useEffect } from "react";
import { LeaderPanel } from "@/components/custom/leader-panels/leader-panel";
import { WindowPanel } from "@/components/custom/leader-panels/window-panel";
import { TabContainer } from "@/components/custom/tab-container";
import { useEditorStore } from "@/store/editor-store";
import { LeaderButton } from "@/components/custom/leader-button";
import useSWR from "swr";
import { ConfirmationModal } from "@/components/custom/modals/confirmation-modal";
import { SearchPanel } from "@/components/custom/leader-panels/search-panel";
import { SearchModal } from "@/components/custom/modals/search-modal";
import { ImageModal } from "@/components/custom/modals/image-modal";
import { PublishModal } from "@/components/custom/modals/publish-modal";

export default function Home() {
	const leaderPanel = useEditorStore((state) => state.openLeaderPanel);
	const windowPanel = useEditorStore((state) => state.openWindowPanel);
	const searchPanel = useEditorStore((state) => state.openSearchPanel);
	const searchModal = useEditorStore((state) => state.openSearchModal);
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


	const { data, isLoading } = useSWR<SidebarData>(`/api/directory`, async () => {
		const req = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/directory`,
			{
				credentials: 'include'
			});
		return await req.json();
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
		<div className="bg-background w-dvw h-dvh flex justify-center items-center pt-14 px-4 font-libre text-lg">
			<Header />
			{openSidebar && <Sidebar sidebarData={data} sidebarDataIsLoading={isLoading} />}
			<TabContainer />
			{leaderPanel && <LeaderPanel />}
			{windowPanel && <WindowPanel />}
			{searchPanel && <SearchPanel />}
			<LeaderButton />
			{directoryConfirmation && <ConfirmationModal />}
			{searchModal && <SearchModal />}
			{imageModal && <ImageModal />}
			{publishModal && <PublishModal />}
		</div>
	);
}
