'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar/sidebar";
import { DirectoryTree, SidebarData } from "@/types/sidebar-types";
import { useEffect } from "react";
import { LeaderPanel } from "@/components/custom/leader-panel";
import { WindowPanel } from "@/components/custom/window-panel";
import { TabContainer } from "@/components/custom/tab-container";
import { useEditorStore } from "@/store/editor-store";
import { LeaderButton } from "@/components/custom/leader-button";
import useSWR from "swr";

export default function Home() {
	const leaderPanel = useEditorStore((state) => state.openLeaderPanel);
	const windowPanel = useEditorStore((state) => state.openWindowPanel);
	const { openSidebar, openLeaderPanel, openWindowPanel, setDirectoryState, setLocation } = useEditorStore((state) => state);


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
			setLocation(Object.keys(directory)[0]);
		}
	}, [data]);

	return (
		<div className="bg-background w-dvw h-dvh flex justify-center items-center pt-14 px-4 font-custom text-lg">
			<Header />
			{openSidebar && <Sidebar sidebarData={data} sidebarDataIsLoading={isLoading} />}
			<TabContainer />
			{openLeaderPanel && <LeaderPanel />}
			{openWindowPanel && <WindowPanel />}
			<LeaderButton />
		</div>
	);
}
