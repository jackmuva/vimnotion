'use client';
import { VimEditor } from "@/components/custom/vim-editor";
import { Header } from "@/components/custom/header";
import { Sidebar } from "@/components/custom/sidebar";
import { useEffect, useState } from "react";

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
      <VimEditor toggleSidebar={toggleSidebar} />
    </div>
  );
}
