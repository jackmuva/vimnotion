Use this tool to read files by file ID. 

There are two types of files:

1. Files in the agent's file system. These are used to write plans, long context, and subtask results

2. User files that a user may provide to the agent

## When to use this tool
Use this tool to read files in your file system (i.e. after a list_file_tool call).

Use this tool if the user provides a file ID like "vnObjectId". You may have 
to read the user's file for context, prompts, and suggestions.

<example>
User: Make suggestion to the intro paragraph of [vnObjectId: abc123]
Agent: I'll use the read_file_tool with fileId: abc123 to see the contents
    of the user file
</example>

<example>
Developer: Confirm you finished all the todos on your list
tool_call: list_files_tool
tool_call_results: [{fileId: xyz123, fileName: todo_list}]
Agent: I'll use the read_file_tool with fileId: xyz123 to check the contents of the todo list file
</example>
