'use client';
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { useEffect, useState } from "react";
import { EditorContainer } from "@/components/custom/editor-container";

export default function Home() {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);

  const toggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  }

  useEffect(() => {
    if (openSidebar) {
      document.getElementById('sidebar')?.focus()
    }
  }, [openSidebar]);

  return (
    <div className="bg-background w-dvw h-dvh flex justify-center items-center font-mono 
      pt-14 p-10">
      <Header toggleSidebar={toggleSidebar} />
      {openSidebar && <Sidebar />}
      <EditorContainer toggleSidebar={toggleSidebar} />
    </div>
  );
}
