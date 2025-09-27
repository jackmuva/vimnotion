'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar/sidebar";
import { SidebarData } from "@/types/sidebar-types";
import { useEffect, useState } from "react";
import { LeaderPanel } from "@/components/custom/leader-panel";
import { WindowPanel } from "@/components/custom/window-panel";
import { TabContainer } from "@/components/custom/tab-container";
import { PanelType, useEditorStore } from "@/store/editor-store";
import { LeaderButton } from "@/components/custom/leader-button";
import useSWR from "swr";

export default function Home() {
	const leaderPanel = useEditorStore((state) => state.openLeaderPanel);
	const windowPanel = useEditorStore((state) => state.openWindowPanel);
	const { openSidebar, openLeaderPanel, openWindowPanel } = useEditorStore((state) => state);


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

	return (
		<div className="bg-background w-dvw h-dvh flex justify-center items-center font-custom
			      pt-14 px-4 text-lg">
			<Header />
			{openSidebar && <Sidebar sidebarData={data} sidebarDataIsLoading={isLoading} />}
			<TabContainer />
			{openLeaderPanel && <LeaderPanel />}
			{openWindowPanel && <WindowPanel />}
			<LeaderButton />
		</div>
	);
}
