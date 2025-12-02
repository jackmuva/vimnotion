export const START_BUFFER = `# Welcome to VimNotion
## Getting started
1. Press "i" to go into \`insert mode\` and start typing like a normal editor
2. Use "<ESC>" to go into \`normal mode\` at any time
3. Use \`:w\` while in \`normal mode\` to save your VimNotion document
4. \`:mdtutor\` and \`:vimtutor\` for additional guides on how to use VimNotion
5. Open the directory sideabar with "-"
    * Create a new file by typing a file name on a new line
    * Create directories (folders) by typing a directory name followed by the "/"
6. Press the "<space>" key (the leader key) to bring up additional options like:
    * render markdown
    * Inserting an image
    * Searching for a file
    * Publishing a page
7. Try other neovim-like commands like \`:split\`, \`:vsplit\`, and \`:tabnew\``;

export const MD_TUTOR_BUFFER = `# How to get started with Markdown

## What is Markdown?
Markdown was created by John Gruber in 2004 with strong influence from Aaron Schwartz.
Markdown goal? To be a lightweight markup language that was **easily readable** AND **easily 
converted to HTML**!

## Why VimNotion is built on Markdown
There are many popular text editors/note takers like Notion, Obsidian, and Inkdrop 
that embarace Markdown format! Rather than click buttons on navbars or right click 
for menu options, ***you can create headers, bullets, links or bold, italic, underline
text*** directly in your text with Markdown syntax.

VimNotion is all about flow, so keeping your hands on your keyboard with the ability to 
move at the speed of your thoughts is what it's all about.

## Markdown Basics
**Before reading the markdown syntax guidelines, hit "<space>m" (while in "normal mode" (fat cursor)) to convert this page into 
html and see markdown rendering in action! (If you're in "insert mode," hist "<ESC>" to go into "normal mode").**

---
# One hashtag followed by a space for a heading 1
## Two hashtags for a heading 2
### ... so on and so forth

---
* a star followed by a space for a bullet list
* second item
* ...

1. A number followed by a period followed by a space for an ordered list
2. second item
3. ...

---
Bold text with two stars **bolded**, italicize text with one star *italicized*.

Two newlines (enter keys) to start a new line. One newline will just continue your paragraph,
so for example, this sentence will still be just one line.

---
Link external websites with this bracket/parentheses syntax [clickable text that will link to](https://example.com)

Images have similar syntax, but include an "!" 
![alt text for the image](${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/8df757fa-2252-4991-81e8-ece73eaec11f)

You can add your own images by hitting "<space>i" while your editor is in "normal mode" (cursor is fat).
If your in "insert mode," hist "<ESC>" to go into normal mode.

---
> For block quotes, use the ">" character
> 
> add an emty line for multi-line block quotes

\`\`\`javascript
use 3 backticks with the language name for codeblocks
(the language name is optional, but some markdown editors will 
have syntax highlighting)
\`\`\`
`;

export const VIM_TUTOR_BUFFER = `# How to get started with the *Vim* of VimNotion

## What is Vim?
Vim is actually just a text editor (like Microsoft Word)! Vim has a rich history that 
starts with text editors like ed, em, and vi written in the 1970s. Bram Moolenaar wrote 
*Vim* (Vi Improved) from a vi clone and is now one of the most popular text editors, especially 
for programmers that work on servers.

Vim is pre-packaged in most Unix based systems. In fact, if you open your terminal and type in "vim" I
would bet your marchine already has vim installed.
---

## Why is Vim such a core piece of VimNotion?
Besides its namesake, VimNotion embraces Vim not because of its complicated commands and key combinations,
but because **Vim's ergonomics keep you in the flow of writing once those keybindings are muscle memory.**

I've found that once I've gotten familiar with Vim and its keybindings, I'm able to type and edit notes, 
code, documentation, any type of text closer to the speed of my thoughts. I can navigate lines, change text, 
and find things extemely quickly without context switching to my mouse and instead just keep my fingers flying.

***Vim is a tool I just love using. When you love your tools, it really is easier to love your work.***

---

## Some Vim basics
This guide isn't a comprehensive tutorial to all of the different Vim keybindings. It's more to help you 
get started. 

### Navigating the cursor with Vim
In general, try to only use the keyboard when working with Vim.

To move your cursor, use "h," "j," "k," and "l."

"j" and "k" move you up and down. "h" and "l" moves you left and right.

---

### Adding text
Using h, j, k, and l to put your cursor in the right spot, when you're ready to add some text, use 
"i" (insert) and "a" (append) to go into "insert mode."

Try editing the first line to match the second line with "i" and "a"

1. Inert text wth i ad a
2. Insert text with i and a

You'll notice that "i" puts your cursor at the beginning of your fat cursor, and "a" put your cursor at 
the end of you fat cursor.

You can exit "insert mode" and go back into "normal mode" by pressing "<ESC>"

---

### Deleting text
Let's get started with some more fun keybindings so you can start to feel the Vim speed!

"x" is how you delete a character. Instead of pressing "i" or "a" and backspacing, you can use a number followed by 
a motion (the "x" motion). Go to the beginning of the next line and try typing "11xl"

extra text Relevant text
Relevant text

If you remember "l" moves your cursor right. "11xl" deletes 11 characters to the left.

"d" is another way to delete, but "d" is a modifier that requires an additional motion.

For example:
* dw deletes word
* dd deletes the line
* diw deletes in word if your cursor is in the middle of the word

Try these out here:

1. Delete this random word with dw. Delete the next two words nonsense words with 2dw.
2. Delete this word with dw. Delete the next two words with 2dw.

---

### Copying and pasting
Use "y" to yank (copy) text, and then "p" to paste. Again you can use a count and a motion with "y" and "p"

Try to make the next two lines match with "y" and "p"

1. Try yanking two words with 2yw and then p:
2. Try yanking two words with 2yw and then p:two words

To cut and paste, instead of using "y" just use "d"

1. Put these here:
2. Put these here:two words

---

### Navigating a document
You can use "j" and "k" to move up and down a document, and even use a count and motion like "10j" to move quicker.

Here are some other useful vertical navigation keybindings:
* gg to go to the top of the doc
* G to go to the bottom
* <ctrl>d to move halfway down your screen
* <ctrl>u to move halfway up your screen
* { to move up to the next blank line
* } to move down to the next blank line

You should also use the "/" followed by a search keyterm to search for a word in your document.
After pressing <enter> you can press "n" to move to the next occurance and "N" to move to the previous one.

---

### Additional line navigation
If you have a long line, "h" and "l" may be not the best way to move within a line.

* _ to go to the beginning of the line
* $ to go to the end of the line
* w to go to the beginning of the next word
* e to got to the end of the next word
* b to go to the beginning of the **previous** word

One of my most used motions is "f" and "F". "f" followed by a character will go to the next occurence of that
character. "F" works the exact same but it will go to the previous occurence of that character in the line.

Try this:

1. Start at the beginning of the line with _ and then jump the the first a with "fa"
2. Start at the beginning of this line with _ and press "fa" and then press ";"

the ";" will go the next occurence without pressing "fa" again

---

### View mode
We went over how "i" and "a" will put you in insert mode, and "<ESC>" will put you back in normal mode. 
The other useful mode is view mode with "v"

In view mode you can highlight text, move around with "w" or "b" or "f" or "h" before yanking or deleting.

### Executables
While not directly a part of Vim motions, executables are how VimNotion, NeoVim, and other extensions 
execute an action like quitting, saving a file, and creating tabs. The most important ones in VimNotion
are inspired from NeoVim, an extension of the Vim text editor.

* ":q" to quit a document **WITHOUT** saving
* ":w" to save a document
* ":wq" to save and quit
* ":split" to split your screen into two separate panels
* ":vs" to vertically split your screen
* ":tabnew" to open a tew tab which you can toggle between with "gt" and "gT" (forward and backward)
---

`;
