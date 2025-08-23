'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { useEffect, useState } from "react";
import { EditorContainer } from "@/components/custom/editor-container";
import { LeaderPanel } from "@/components/custom/leader-panel";

export default function Home() {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [leaderPanel, setLeaderPanel] = useState<boolean>(false);

  const toggleLeaderPanel = () => {
    setLeaderPanel((prev) => !prev);
  }

  const toggleSidebar = () => {
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
    if (openSidebar) {
      document.getElementById('sidebar')?.focus()
    }
  }, [openSidebar]);

  return (
    <div className="bg-background-muted/20 w-dvw h-dvh flex justify-center items-center font-mono 
      pt-14 p-10">
      <Header toggleSidebar={toggleSidebar} />
      {openSidebar && <Sidebar />}
      <EditorContainer toggleSidebar={toggleSidebar} toggleLeaderPanel={toggleLeaderPanel} />
      {leaderPanel && <LeaderPanel />}
    </div>
  );
}
