import { Editor } from '@tiptap/react';
import { useState } from 'react';

export const MarkdownToolbar = ({
  mode,
  editor,
}: {
  mode: "COMMAND" | "INSERT",
  editor: Editor,
}) => {

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
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = document.getElementById("exec-input");
            if (input) {
              //@ts-expect-error value does exist on html element
              console.log(input.value);
              //@ts-expect-error value does exist on html element
              input.value = "";
              input.blur();
            }
          }}>
            <input className='h-4 absolute bottom-1 left-4 focus:outline-none w-full' id="exec-input" />
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
