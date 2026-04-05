import { Editor } from '@tiptap/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ToolbarExec } from './toolbar-exec';
import { useEditorStore } from '@/store/editor-store';
import { PanelType, PaneNode, SplitState } from '@/types/editor-types';
import { Quote, Code, Image, List, ListTodo, ListOrdered } from 'lucide-react';
import { uploadImageToBackend } from '@/services/api-service';

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
  const imageFile = useRef<HTMLInputElement | null>(null);

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


  const uploadImage = () => {
    imageFile.current?.click();
  }

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file)
    fileReader.onload = async () => {
      if (!fileReader.result || typeof fileReader.result !== 'string') return;
      const result = await uploadImageToBackend(fileReader.result);
      editor?.chain().insertContentAt(editor.state.selection.anchor, {
        type: 'image',
        attrs: {
          src: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/${result.Data}`,
          alt: "new-image",
        },
      }).focus().run()
    }
  }

  const typeWithDelay = async (inputs: string, editor: Editor) => {
    for (const char of inputs) {
      let pos: number = editor.state.selection.$anchor.pos;
      editor.chain().insertContentAt(pos, char).run();
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    let pos: number = editor.state.selection.$anchor.pos;
    editor.chain().insertContentAt({ from: pos - inputs.length, to: pos }, "").run();
  }

  return (
    <div className={`rounded-sm h-16 flex px-4 text-sm font-mono w-full max-w-[1100px]
      items-center relative
					${mode === "COMMAND"
        ? "bg-radial-[at_50%_175%] from-background to-indigo-900/20 dark:to-indigo-900/75 to-100%"
        : "bg-radial-[at_50%_100%] from-background to-orange-900/20 dark:to-orange-900/75 to-100%"
      }`}>
      <span className={`text-base font-bold mr-4 bg-clip-text text-transparent
      bg-linear-to-r ${mode === "COMMAND" ? "from-indigo-200 via-blue-200 to-fuchsia-200" :
          "from-orange-400 via-amber-200 to-fuchsia-200"}`}
      >{mode}</span>
      {mode === "COMMAND" ? (
        <>
          <span className="flex items-center gap-4">
            <span>↑j k↓ move</span>
            <span className="text-blue-150">|</span>
            <span>&quot;<strong>-</strong>&quot; directory sidebar</span>
            <span className="text-blue-150">|</span>
            <span>&quot;<strong>SPACE</strong>&quot; leader menu</span>
            <span className="text-blue-150">|</span>
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
          <span className="text-blue-150">|</span>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {
              editor.commands.setParagraph();
              editor.chain().focus().run();
            }}>
            p
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("# ", editor);
              editor.commands.setHeading({ level: 1 });
              editor.chain().focus().run();
            }}>
            h1
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("## ", editor);
              editor.commands.setHeading({ level: 2 });
              editor.chain().focus().run();
            }}>
            h2
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("## ", editor);
              editor.commands.setHeading({ level: 3 });
              editor.chain().focus().run();
            }}>
            h3
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("* ", editor);
              editor.commands.toggleBulletList();
              editor.chain().focus().run();
            }}>
            <List size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("1. ", editor);
              editor.commands.toggleOrderedList();
              editor.chain().focus().run();
            }}>
            <ListOrdered size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("[] ", editor);
              editor.commands.toggleTaskList();
              editor.chain().focus().run();
            }}>
            <ListTodo size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={() => {
              uploadImage();
            }}>
            <Image size={16} />
          </button>
          <input type="file" id="image" style={{ display: 'none' }} ref={imageFile} accept="image/*" onChange={handleImage} />
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockEnd().run();
              await typeWithDelay("\n---\n", editor);
              editor.commands.insertContent("<hr/>");
              editor.chain().focus().run();
            }}>
            -
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockEnd().run();
              await typeWithDelay("\n```\n", editor);
              editor.commands.insertContent("<pre></pre>");
              editor.chain().focus().run();
            }}>
            <Code size={16} />
          </button>
          <button className='text-sm font-robo-mono border border-foreground-muted/50 rounded-sm 
                          px-2 py-0.5 flex items-center bg-orange-900/90 font-semibold cursor-pointer'
            onClick={async () => {
              editor.chain().focus().selectTextblockStart().run();
              await typeWithDelay("> ", editor);
              editor.commands.setBlockquote();
              editor.chain().focus().run();
            }}>
            <Quote size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
