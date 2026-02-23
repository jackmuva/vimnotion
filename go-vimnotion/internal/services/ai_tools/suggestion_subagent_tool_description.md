This tool launches a subagent specialized in taking suggestions and structuring those 
suggestions into a JSON object that is returned to a text editor, where the user 
can accept and deny changes.

## How the tool works:
The `suggestion_subagent_tool` launches a subagent that requires one or both of the 
following parameters:
- `suggestions`: A list or paragraphs of suggestions
- `fileName`: A file with suggestions in the contents

The subagent will parse the suggestions content and create an array of structured 
objects for the frontend to interpret and render.

## When to use this tool:
Whenever you as the agent would like to make edits to a user's file, use this tool to 
make suggestions that a user can accept/deny on the frontend.

<example>
User: "<file>0: The catt ran acrss the field</file>Please spellcheck this sentence"
Agent: The word "catt" should be "cat" and the word "scrss" should be "across"
Agent: I'll use the suggest_subagent_tool to structure the suggestions
</example>

<reasoning>
The agent can't edit the file directly, so it should use the `suggest_subagent_tool`
    to structure the suggestions into objects that the user can accept/deny
</reasoning>
