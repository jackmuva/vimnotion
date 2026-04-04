import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { ToolbarExec } from './toolbar-exec';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';

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
    );
    setExec(toolbarExec);
  }, []);

  const executeCommand = async (command: string) => {
    if (!exec) return;
    const cmd = command.trim();
    if (!cmd) return;

    switch (cmd) {
      case ':w':
      case ':write':
        await exec.write();
        break;
      case ':e':
      case ':edits':
        exec.update();
        break;
      case ':q':
      case ':quit':
        exec.quit();
        break;
      case ':wq':
      case ':wquit':
        await exec.saveAndQuit();
        break;
      case ':split':
        exec.split();
        break;
      case ':vs':
      case ':vsplit':
        exec.vsplit();
        break;
      case ':mdtutor':
        exec.mdTutor();
        break;
      case ':vimtutor':
        exec.vimTutor();
        break;
    }
  }

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
            <span>-: directory sidebar</span>
            <span className="text-blue-200">|</span>
            <span>SPACE: leader menu</span>
          </span>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const input = document.getElementById(`exec-input-${paneId}`);
            if (input) {
              //@ts-expect-error value does exist on html element
              await executeCommand(input.value);
              //@ts-expect-error value does exist on html element
              input.value = "";
              input.blur();
            }
          }}>
            <input className='h-4 absolute bottom-1 left-4 focus:outline-none w-full' id={`exec-input-${paneId}`} />
          </form>
        </>
      ) : (
        <div>
          <span className="font-bold mr-4">-- {mode} --</span>
          <span>esc:command mode</span>
        </div>
      )}
    </div>
  );
}
