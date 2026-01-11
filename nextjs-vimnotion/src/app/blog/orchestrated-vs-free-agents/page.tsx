"use server";

import Link from "next/link";
import type { Metadata } from "next";
import { DocContent } from "@/app/doc/[fileId]/doc-content";

export async function generateMetadata(): Promise<Metadata> {
	const metadata: Metadata = {
		title: "Orchestrating and Freeing Agents on a Saturday Night | VimNotion",
		description: "Let's compare how a strictly orchestrated agent compares to a sandboxed agent free to run in a loop",
		openGraph: {
			title: "Orchestrating and Freeing Agents on a Saturday Night | VimNotion",
			description: "Let's compare how a strictly orchestrated agent compares to a sandboxed agent free to run in a loop",
			type: "article",
		},
	};
	return metadata;
}

export default async function OrchestatedVsFreeAgentPage() {
	const mdContent = `
# Orchestrating and Freeing Agents on a Saturday Night

Yes, it's Saturday night. And yes, I'm spending it tinkering with different agent implementations. No, this is not for work.

With all of that out of the way, I've been seriously interested in building two types of AI applications:
1. A strictly orchestrated agent workflow
2. A "liberated agent," free to loop and tool call away.

I have a task in mind that works really well for both use cases. 

> Create a custom newsletter from websites that I frequently scan for articles

Let's see what happens!

---

## Orchestrated vs Free Agents
A task like writing a newsletter can be broken down into a series of subtasks. 
The workflow for writing a newsletter if I were to do it myself would be something like this:

1. I skim a website like HackerNews, reading the post titles
2. I click on links that interest me to read more
3. I write a summary of articles that I like
4. I pick a theme that ties together the articles I pick for the newsletter

It's not hard to imagine these steps written in code, especially with LLMs to structure 
unstructured data. 

![ascii-workflow](https://api.vimnotion.com/image/5cad7fa8-7703-44c6-bb00-080ebf24da2b)

### The Orchestrated Agent
An **orchestrated agent** is one where I define the agent's workflow explicitly. 
Every step (or node in the workflow graph) runs either 

* code to call APIs like Firecrawl and re-structure data
* an LLM step to generate text or generate structured data

My orchestration framework was inspired by the likes of ai-sdk's workflows, 
LangChain's LangGraph, and my operations research classes. (I miss the good old 
Simplex Method and Min-Cut Flow Algorithm, but I digress.)

The LLM capability to "generate structure data aspect" is truly magical. 
It's a bridge that lets us take text and extract the information to a structured schema 
with type safety for further code steps (bridging code together, impossible without language models).

\`\`\`typescript
const selectorNode = new GraphNode<MdLinks, EnrichedLinks, NodeNames>({
	nodeType: NodeNames.SELECTOR_NODE,
	description: "From a webpage, an agent will select the most interesting articles with links",
	exec: async (input: MdLinks) => {
		const systemPrompt: string = \`You are a content curator tasked with selecting article titles that will interest the unique reader. 
		Readers will give you a page with articles and you will select only the top "x" number of articles that they may like.
		Only respond with the list of article titles!\`;

		const filteredLinks: EnrichedLinks = {};
		for (const url of Object.keys(input)) {
			const prompt: string = \`\${input[url]?.instructions} 
						Select up to \${input[url]?.limit} articles from this page:
						\${input[url]?.md}\`;
			const articleList: { title: string, url: string }[] = await retry<{ title: string, url: string }[]>(async () => {
				const { output } = await generateText({
					model: "anthropic/claude-sonnet-4.5",
					system: systemPrompt,
					prompt: prompt,
					output: Output.array({
						element: z.object({
							title: z.string().describe("Title of the article picked"),
							url: z.string().describe("url of the article picked"),
						}),
					}),
				});
				return output
			}, 3, 1);
			filteredLinks[url] = { ...input[url], links: articleList }
		}
		return filteredLinks;
	},
	routing: (): NodeNames | null => {
		return NodeNames.SUMMARIZER_NODE;
	},
});
\`\`\`

### The Liberated Free Agent
The **free agent** is an agent that's given a harness with a runtime, tools, prompts, 
and filesystem, and just loops until task completion. I used LangChain's 
[deepagents](https://docs.langchain.com/oss/javascript/deepagents/overview)
because it comes with a pre-configured harness for working with subagents and filesystem tools.

\`\`\`typescript
const agent = createAgent({
	model: "claude-sonnet-4-5-20250929",
	middleware: [
		toolCallLimitMiddleware({
			toolName: "markdown_search",
			threadLimit: 8,
			runLimit: 8,
		}),
		modelCallLimitMiddleware({
			threadLimit: 15,
			runLimit: 15,
			exitBehavior: "end",
		}),
		todoListMiddleware({}),
		createFilesystemMiddleware({
			backend: new FilesystemBackend({
				rootDir: "./"
			})
		}),
	],
	tools: [markdownSearch],
});
\`\`\`

I enforced some limits to not burn through my Firecrawl and Anthropic credits, but 
besides that, this agent was born to go as deep as it wanted to with the deepagent harness 
and as far as it wanted in any direction.

---

## Who Writes a Better Newsletter? The Structured or the Creative?
I gave both the agents similar input prompts. For the orchestrated agent:


\`\`\` typescript
const scriptInput: ScriptInput = {
	sources: [
		{
			url: "https://news.ycombinator.com",
			instructions: \`Pick articles that have to do with AI news, typescript, golang, architecture, product tastes, and game dev.
			Ignore posts about jobs, non-tech news, topics about medicine or hardware\`,
			limit: 2
		},
		{
			url: "https://theringer.com",
			instructions: \`I enjoy mostly reading about NBA, player features, and unusual trends about any sport really\`,
			limit: 2
		},
	]
}
\`\`\`

For the free agent:

> Please write a newsletter with 2 articles from hackernews.com  and 2 from theringer.com.
>
> For tech, I like articles with AI news, typescript, golang, architecture, product tastes, and game dev.
>
> For sports, I enjoy reading mostly about the NBA, player features, and unusual trends in any sport really.

Here are both newsletters so you can judge for yourself!

[Curated Newsletter by the Structured Graph Agent](https://www.vimnotion.com/doc/94d52ee5-367e-4826-b7c8-3f9e2ed2ddd4)

[Curated Newsletter by the Freelancing DeepAgent](https://www.vimnotion.com/doc/0fce5392-0a94-4675-8d98-7accb7a1c4d3)

I personally like the free agent newsletter a bit better. Perhaps it was my prompts in some of the 
bridge LLM nodes, but the orchestrated agent's newsletter was wordier and more click-baity.

Self-reflecting, I was also a bit more excited for the free agent's newsletter, because I didn't know what 
it would write. Whereas in the orchestrated workflow, because I wrote every step, I knew the exact
newsletter structure, ruining a bit of the excitement and unknown factor.

---

## Agent Design Implications
This was a fun exercise building agents with two different design philosophies.

My overall takeaways are actually not performance based (I think both agents did great, and 
the orchestrated graph agent is easier to tune):

### 1. Better models and better harnesses result in agents capable of running longer to complete even complex tasks
    
Breaking down tasks to essentially creating their own workflows with
"todo" tools, writing large text in files to save context, reading files from a filesystem
locally for low-latency RAG - these are all examples of better tooling for agents.

### 2. Orchestrating is like doing the reasoning for the agent

Better models and harnesses means building a world where agents can reason out even complex tasks.
But what I didn't mention from running the sandboxed deepagent is that the **token and cost usage was 
astronomically higher than the orchestrated agent**. Controlling the exact inputs for agents 
is extremely token efficient and takes less LLM turns.

### 3. Gain control, sacrifice flexibility

Code has always been a way to express our thoughts in a very direct way. You can misconstrue words, 
but code is interpreted the same way every time. It can be powerful to control every LLM call, put 
in exact inputs, get exact outputs. But the orchestrated agent can really only do one thing. Take 
that same orchestrated graph agent and force it to proofread articles, and it will fail miserably. 
Free agents have harnesses that are universally useful. Prompts are its scripts. Prompts are its code.
Sometimes that code will be misinterpreted, but it's easier to iterate on a prompt than iterate on 
code (even with coding agents).

What's still interesting to debate is if it's easier to evaluate and iterate on orchestrated agents 
or free-running agents. Writing a new prompt for a new use case will be easier and faster than 
creating a new orchestration flow, but the tracing, the tuning, and the path to production may 
be faster with orchestrated agents. Maybe?

That'll be a question for another Saturday night.

:wq

-Jack
`;
	return (
		<div className="px-2 w-full flex flex-col items-center pt-4">
			<div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 pb-10">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
							className="hover:text-foreground/30">
							{"< Back to blog"}
						</Link>
						<div className="text-base flex w-full justify-between items-center 
							border-b border-b-foreground/30
						pb-2">
							<div>
								Written by: Jack
							</div>
							<div>
								Published: January 11, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</div>
				</div>
				<DocContent id="orchestration-vs-free-agent"
					content={mdContent} />
			</div>
		</div>
	);
}
