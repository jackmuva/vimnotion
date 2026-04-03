import { Editor } from '@tiptap/react';

export const MarkdownToolbar = ({
  mode,
  editor,
}: {
  mode: "COMMAND" | "INSERT",
  editor: Editor
}) => {
  return (
    <div className={`rounded-sm h-8 flex items-center px-4 pl-8 text-sm font-mono w-full 
					${mode === "COMMAND"
        ? "bg-indigo-900 text-white"
        : "bg-orange-900 text-white"
      }`}>
      <span className="font-bold mr-4">-- {mode} --</span>
      {mode === "COMMAND" ? (
        <span className="flex items-center gap-4">
          <span>↑j k↓ move</span>
          <span className="text-blue-200">|</span>
          <span>-: directory sidebar</span>
          <span className="text-blue-200">|</span>
          <span>SPACE: leader menu</span>
        </span>
      ) : (
        <span>esc:command mode</span>
      )}
    </div>
  );
}
