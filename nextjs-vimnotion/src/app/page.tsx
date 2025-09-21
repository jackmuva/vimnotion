'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { useEffect, useState } from "react";
import { LeaderPanel } from "@/components/custom/leader-panel";
import { WindowPanel } from "@/components/custom/window-panel";
import { TabContainer } from "@/components/custom/tab-container";
import { useEditorStore } from "@/store/editor-store";
import { LeaderButton } from "@/components/custom/leader-button";

export default function Home() {
	const [openSidebar, setOpenSidebar] = useState<boolean>(false);
	const [leaderPanel, setLeaderPanel] = useState<boolean>(false);
	const [windowPanel, setWindowPanel] = useState<boolean>(false);
	const setActivePanel = useEditorStore((state) => state.setActivePanel);

	const toggleWindowPanel = () => {
		if (windowPanel) {
			setActivePanel(null);
		} else {
			setActivePanel("window");
		}
		setWindowPanel((prev) => !prev);
	}

	const toggleLeaderPanel = () => {
		if (leaderPanel) {
			setActivePanel(null);
		} else {
			setActivePanel("leader");
		}

		setLeaderPanel((prev) => !prev);
	}

	const toggleSidebar = () => {
		if (openSidebar) {
			setActivePanel(null);
		} else {
			setActivePanel("sidebar");
		}

		setOpenSidebar((prev) => !prev);
	}

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
		if (openSidebar) {
			document.getElementById('sidebar')?.focus()
		}
	}, [openSidebar]);

	return (
		<div className="bg-background-muted/20 w-dvw h-dvh flex justify-center items-center font-custom
			      pt-14 px-4 text-lg">
			<Header toggleSidebar={toggleSidebar} />
			{openSidebar && <Sidebar closeSidebar={toggleSidebar} />}
			<TabContainer toggleSidebar={toggleSidebar} toggleLeaderPanel={toggleLeaderPanel} />
			{leaderPanel && <LeaderPanel closePanel={toggleLeaderPanel} toggleWindowPanel={toggleWindowPanel} />}
			{windowPanel && <WindowPanel closePanel={toggleWindowPanel} />}
			<LeaderButton toggleLeaderPanel={toggleLeaderPanel} />
		</div>
	);
}
