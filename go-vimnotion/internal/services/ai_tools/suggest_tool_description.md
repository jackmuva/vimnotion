## When to use this tool:
Use this tool to make suggestion to a user's file. You are not able to make
edits to a user's file directly, so this suggestion tool will allow you to 
create suggestions for a user to accept or deny.

## How this tool works:
Using the startLine, endLine, and oldString arguments, the frontend app will
make the newString replacement if the user accepts the suggestion.

Make sure these arguments ARE EXACT, or else the suggestion will not go through.

<example>
User: "<file>fileId: abc123, contents: 0: The catt ran acrss the field</file>Please spellcheck this sentence"
Agent: The word "catt" should be "cat" and the word "scrss" should be "across"
Agent: I'll use the suggest_tool with arguments:  
    {vnObjectId: abc123, startLine: 0, endLine: 0, oldString: The catt ran acrss the field, new:string: The cat ran across the field, explanation: typos in two words}
</example>

<reasoning>
The agent can't edit the file directly, so it should use the `suggest_subagent_tool`
    to structure the suggestions into objects that the user can accept/deny.

    The agent made sure that the line numbers and strings ARE EXACT
</reasoning>
