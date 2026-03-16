## When to use this tool:
Use this tool to make suggestion to a user's file. You are not able to make
edits to a user's file directly, so this suggestion tool will allow you to 
create suggestions for a user to accept or deny.

## How this tool works:
Using the startLine, endLine, and oldString arguments, the frontend app will
make the newString replacement if the user accepts the suggestion.

### IMPORTANT
* Make sure the startLine, endLine, and oldString arguments ARE EXACT, or else the suggestion will not go through.
* Keep suggestions to a 3 line maximum. For suggestions longer than 3 lines, use multiple suggestion_tool calls

### Correct Examples
<example>
User: "<file>{fileId: abc123, contents: 0: The catt ran acrss the field}</file>Please spellcheck this sentence"
Agent: The word "catt" should be "cat" and the word "scrss" should be "across"
Agent: I'll use the suggest_tool with arguments:  
    {vnObjectId: abc123, startLine: 0, endLine: 0, oldString: The catt ran acrss the field, newString: The cat ran across the field, explanation: typos in two words}
</example>

<reasoning>
The agent can't edit the file directly, so it should use the `suggest_subagent_tool`
    to structure the suggestions into objects that the user can accept/deny.

The agent made sure that the line numbers and strings ARE EXACT. The agent also 
kept the suggestion 1 line long to avoid having a suggestion more than 3 lines long.
</reasoning>

<example>
User: "<file>{fileId: xyz123, contents: 0: Theirs something in the water
        1: What could it be?
        2: Not sure
        3: Ill find out}</file>Please proofread this section"
Agent: I'll use the suggest_tool with arguments:  
    {vnObjectId: xyz123, startLine: 0, endLine: 0, oldString: Theirs something in the water, newString: There's something in the water, explanation: wrong use of "their"}
Agent: I'll use the suggest_tool with arguments:  
    {vnObjectId: xyz123, startLine: 3, endLine: 3, oldString: Ill find out, newString: I'll find out, explanation: missing apostraphe for contraction}
</example>

<reasoning>
Because the suggestion will span more than 3 lines, the agent should use multiple suggest_tool calls
</reasoning>
