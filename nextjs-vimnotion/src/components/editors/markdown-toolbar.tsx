import { Editor } from '@tiptap/react';
import { useState } from 'react';

export const MarkdownToolbar = ({
  mode,
  editor,
  exec,
}: {
  mode: "COMMAND" | "INSERT",
  editor: Editor,
  exec: string,
}) => {

  return (
    <div className={`rounded-sm h-16 flex px-4 text-sm font-mono w-full max-w-[1100px]
      items-center relative
					${mode === "COMMAND"
        ? "bg-indigo-900 text-white"
        : "bg-orange-900 text-white"
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
          <div className='h-4 absolute bottom-1 left-4'>
            {exec}
          </div>
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
