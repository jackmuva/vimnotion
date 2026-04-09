import { useEditorStore } from "@/store/editor-store";
import { EditorType } from "@/types/editor-types";

export const WelcomeModal = ({
  close
}: {
  close: () => void
}) => {
  const setDefaultEditorType = useEditorStore((state) => state.setDefaultEditorType);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
				z-30 h-[200px] max-h-11/12 max-w-11/12 w-[500px] p-4 
				flex flex-col items-center justify-center gap-4 bg-foreground-muted/10
				outline outline-offset-2 outline-foreground-muted/50">
      <div className="font-robo-mono text-lg text-center">
        Welcome to VimNotion. Do you use vim btw?
      </div>
      <div className="flex gap-4">
        <button className="border-2 rounded-sm cursor-pointer bg-red-300/30 
							hover:bg-background-muted/50 flex items-center justify-center py-2 px-2 w-full
							space-x-2 text-center text-sm"
          onClick={() => {
            window.localStorage.setItem("defaultEditor", "vim");
            setDefaultEditorType(EditorType.VIM);
            close();
          }}>
          Yes, I use vim btw
        </button>
        <button className="border-2 rounded-sm cursor-pointer bg-blue-300/30 
							hover:bg-background-muted/50 flex items-center justify-center py-2 px-2 w-full 
							space-x-2 text-center text-sm"
          onClick={() => {
            window.localStorage.setItem("defaultEditor", "markdown");
            setDefaultEditorType(EditorType.MARKDOWN);
            close();
          }}>
          No, I'll stick to normal editing for now
        </button>
      </div>
    </div>
  );
}
