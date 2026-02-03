Use this tool to write long text contents to a files that can later be accessed by listing files and reading files.

## When to use this tool:
Use this tool to write content that needs to be referenced in the future or long text
like tool outputs that can later be searched.

<example>
Developer: As a short-lived subagent, proofread this paragraph for grammatical mistakes and write corrections
for the main agent to synthesize.
Agent: I'll proofread this article and write comments to a file using the write_file tool
</example>

<reasoning>
The subagent is ephemeral and so its outputs need to be referencable by a main agent.
</reasoning>

<example>
Plan: 
1. Go through the article looking for grammatical mistakes
2. Make sure tone of the article is appropriate to the brand guidelines
3. Point out stronger hooks and concluding sentences
Agent: I'll go through each step in the plan and write to a file that I can append to
as to keep a running list of comments that I'll reference at the end.
</example>

<reasoning>
For a multi-step task, use a file to keep track of outputs of each step so details
don't get lost
</reasoning>

## When NOT to use this tool:
Do NOT use this tool for small text outputs or outputs that aren't deemed as super 
important.

<example>

</example>
