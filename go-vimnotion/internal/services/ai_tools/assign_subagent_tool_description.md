This tool launches a subagent focused on a single task with its own context window.
Subagents should be used for tasks of a multi-step workflow where only the final 
output is needed.

## How the tool works:
- You are the main agent, and you will give the subagent a subagentPrompt with the task it needs to complete and ALL of the necessary context it needs to complete the task
- You will only be able to send the subagent that first subagentPrompt, you will NOT be 
able to communicate with the subagent after
- The subagent will only return the final output with a summary of what it's done
- If results are lengthy or need to be persisted, subagents can write their results to files

## When to use this tool:
Use this tool when it's beneficial for an agent to perform task in isolation, 
without need for too much context from the message history.

<example>
Developer: Here's a plan for a full editorial review of the user's draft with the following subtasks:
    - [ ] Determine if the article is coherent
    - [ ] Check each paragraph to see if all sentences are concise
    - [ ] Check each paragraph to see if article is grammatically correct
    - [ ] Examine if main argument/point is clearly articulated
Agent: I'll use the subagent tool for each todo in the plan
</example>

<reasoning>
Each subtask can be done independently from one another. The main agent can 
aggregate results from the subagents later and return the final review to the user.
    
Subagents can be focused and perform each subtask without unnecessary context in 
the message history

</reasoning>

<example>
User: Make sure this draft has no grammatical errors
Agent: I'll split up this draft into paragraphs, and give each paragraph to a subagent to check
</example>

<reasoning>
If a large task can be decomposed into small tasks that can be done independently,
    specialized subagents can handle each small task.
</reasoning>

## When NOT to use this tool:
Do NOT use this tool when: 
- you need additional user prompting 
- when message history is needed and it's difficult to summarize that context into a single prompt

<example>
User: Can you change the tone of this paragraph
Agent: It's unclear what type of tone the user would like. Followup with the user to clarify
</example>

<reasoning>
Subagents can only have a single subagentPrompt input, with no followups. 
    The main agent should have a defined task before handing it to a subagent.
</reasoning>
