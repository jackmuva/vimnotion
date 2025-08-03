import { VimEditor } from "@/components/custom/vim-editor";
import { Header } from "@/components/custom/header";

export default function Home() {
  return (
    <div className="bg-background w-dvw h-dvh flex flex-col justify-center items-center font-mono">
      <Header />
      <VimEditor />
    </div>
  );
}
