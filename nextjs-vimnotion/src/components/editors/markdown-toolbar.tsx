import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { ToolbarExec } from './toolbar-exec';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';
import { Quote, Code, Image, List, ListTodo, ListOrdered } from 'lucide-react';

export const MarkdownToolbar = ({
  mode,
  editor,
  paneId,
}: {
  mode: "COMMAND" | "INSERT",
  editor: Editor,
  paneId: string,
}) => {
  const toggleSidebar = useEditorStore((state) => state.toggleSidebar);
  const getActivePanel: () => PanelType = useEditorStore((state) => state.getActivePanel);
  const splitPane = useEditorStore(state => state.splitPane);
  const closePane = useEditorStore(state => state.closePane);
  const getPane: (paneId: string) => PaneNode = useEditorStore((state) => state.getPaneById);
  const updatePane = useEditorStore((state) => state.updatePane);
  const setDirectoryConfirmation = useEditorStore(state => state.setDirectoryConfirmation);
  const renderVimTutor = useEditorStore(state => state.renderVimTutor);
  const getActivePane = useEditorStore(state => state.getActivePane);
  const renderMdTutor = useEditorStore(state => state.renderMdTutor);
  const saveVnObjectBuffer = useEditorStore(state => state.saveVnObjectBuffer);
  const openFileInBuffer = useEditorStore(state => state.openFileInBuffer);
  const createNewTab = useEditorStore(state => state.createNewTab);

  const [exec, setExec] = useState<ToolbarExec | null>(null);

  useEffect(() => {
    const toolbarExec: ToolbarExec = new ToolbarExec(
      () => splitPane(SplitState.VERTICAL),
      () => splitPane(SplitState.HORIZONTAL),
      () => closePane(),
      () => getActivePanel(),
      () => saveVnObjectBuffer(),
      () => setDirectoryConfirmation(true),
      () => toggleSidebar(),
      () => renderMdTutor(),
      () => renderVimTutor(),
      (fileId: string) => openFileInBuffer(fileId),
      () => getActivePane(),
      (paneId: string) => getPane(paneId),
      (paneNode: PaneNode) => updatePane(paneNode),
      () => createNewTab(),
    );
    setExec(toolbarExec);
  }, []);

  return (
    <div className={`rounded-sm h-16 flex px-4 text-sm font-mono w-full max-w-[1100px]
      items-center relative
					${mode === "COMMAND"
        ? "bg-radial-[at_50%_175%] from-background to-indigo-900/20 dark:to-indigo-900/75 to-100%"
        : "bg-radial-[at_50%_100%] from-background to-orange-900/20 dark:to-orange-900/75 to-100%"
      }`}>
      <span className="font-bold mr-4">-- {mode} --</span>
      {mode === "COMMAND" ? (
        <>
          <span className="flex items-center gap-4">
            <span>↑j k↓ move</span>
            <span className="text-blue-200">|</span>
            <span>&quot;-&quot; directory sidebar</span>
            <span className="text-blue-200">|</span>
            <span>&quot;SPACE&quot; leader menu</span>
            <span className="text-blue-200">|</span>
            <div low-data-tooltip={`:vs to vertical split, :split to horizontal split, :w to save, :q to quit, :tabnew to tab`}>
              more commands
            </div>
          </span>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const input = document.getElementById(`exec-input-${paneId}`);
            if (input && exec) {
              //@ts-expect-error value does exist on html element
              await exec.executeCommand(input.value);
              //@ts-expect-error value does exist on html element
              input.value = "";
              input.blur();
            }
          }}>
            <input className='h-4 absolute bottom-1 left-4 focus:outline-none w-full' id={`exec-input-${paneId}`} />
          </form>
        </>
      ) : (
        <div className='flex items-center gap-4'>
          <span>&quot;esc&quot; command mode</span>
          <span className="text-blue-200">|</span>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {
              editor.commands.setParagraph();
            }}>
            p
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            h1
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            h2
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            h3
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <List size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <ListOrdered size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <ListTodo size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <Image size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            -
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <Code size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {

            }}>
            <Quote size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
