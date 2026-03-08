Use this tool to break down a complex ask into smaller subtasks. In general, break larger tasks into 2-5 subtasks.
This tool will create a plan file, that you can read with the read_file_tool and update with the write_file_tool.
You must keep track and update your subtasks!!

## When to use this tool:
Use this tool when the user asks a complex task that's better off split into smaller tasks
that can be done step by step.

<example>
User: Proofread this article for grammatical errors and overall coherence
Agent: I'll proofread this article paragraph by paragraph for grammatical errors and then read the entire paper for overall coherence
*Creates a plan for the overall task with subtasks*
1. Break the article down into paragraphs
2. Read each paragraph checking for grammatical errors, appending each paragraph's suggestions to a suggestions file
3. Read entire article and comment on overall structure and messaging, appending comments to the suggestions file
</example>

<reasoning>
Proofreading anything longer than a few paragraphs requires breaking down the task into smaller, more manageable tasks.
Asking for grammar checks and coherence are two separate tasks.
</reasoning>

## When NOT to use this tool:
Do NOT use this tool when the user prompts a task that is small and easily achievable in a single step

<example>
User: Edit line 15 to be more concise
Agent: I'll check that line and immediately return a more concise version of that sentence.
*Does NOT create a plan with subtasks*
</example>

<reasoning>
Editing one sentence or even a paragraph does not require decomposing the task into subtasks.
</reasoning>
