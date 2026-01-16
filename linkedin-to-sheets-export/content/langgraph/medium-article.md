# State Machines Meet AI: Building Agents with LangGraph

## How thinking in states and transitions changed my approach to AI agents

---

I used to think of AI agents as fancy prompt chains. Input goes in, magic happens, output comes out.

LangGraph changed that. It made me think about agents as **state machines**—explicit states, defined transitions, predictable behavior.

Here's how that shift helped me build a more reliable LinkedIn export agent.

---

## The Problem with "Magic"

Traditional agent frameworks hide complexity. That's great until something goes wrong:

- Why did the agent call that tool twice?
- Why didn't it use the search results?
- Where did the conversation context go?

LangGraph answers these questions by making everything explicit.

## State Machines 101

A state machine has:
- **States**: Where you are
- **Transitions**: How you move between states
- **Conditions**: When transitions happen

For an AI agent:
- **States**: "waiting for input", "calling model", "executing tool"
- **Transitions**: Model decides to use a tool, tool returns result
- **Conditions**: Does the model want to call a tool or respond?

## The LangGraph Implementation

### Defining State

State is explicit and typed:

```typescript
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const AgentState = Annotation.Root({
  // Messages accumulate
  messages: Annotation<BaseMessage[]>({
    reducer: (existing, new_) => existing.concat(new_),
    default: () => [],
  }),

  // Search results get replaced
  searchResults: Annotation<Person[]>({
    reducer: (_, new_) => new_,
    default: () => [],
  }),
});
```

The `reducer` functions are key. They define how state updates:
- Messages **accumulate** (concat)
- Search results get **replaced** (return new value)

### Building the Graph

```typescript
import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const workflow = new StateGraph(AgentState)
  // Two nodes: agent and tools
  .addNode("agent", callModel)
  .addNode("tools", new ToolNode(tools))

  // Start at agent
  .addEdge("__start__", "agent")

  // Agent decides: call tools or finish
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })

  // Tools always return to agent
  .addEdge("tools", "agent");

export const agent = workflow.compile();
```

This is a simple loop:
1. Start → Agent
2. Agent → Tools (if tool call) or End (if response)
3. Tools → Agent

But the explicit structure means I can:
- Add logging at any transition
- Insert human approval before tools
- Retry failed tool calls
- Visualize the execution flow

### The Decision Function

```typescript
function shouldContinue(state: AgentStateType): "tools" | "end" {
  const lastMessage = state.messages[state.messages.length - 1];

  // If AI wants to call tools, go to tools node
  if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
    return "tools";
  }

  // Otherwise, we're done
  return "end";
}
```

No magic. The condition is explicit and testable.

### The Model Node

```typescript
async function callModel(state: AgentStateType) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...state.messages,
  ];

  const response = await model.invoke(messages);

  // Return state update (messages will be appended via reducer)
  return { messages: [response] };
}
```

Nodes return state updates. The reducers handle merging.

## The Tools

LangGraph tools use Zod schemas:

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const searchPeopleTool = tool(
  async ({ keywords, location, title, limit }) => {
    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords, location, title, limit }),
      }
    );

    const data = await response.json();
    const people = formatPeople(data);

    return JSON.stringify({
      success: true,
      people,
      count: people.length,
    });
  },
  {
    name: "search-people",
    description: "Search LinkedIn profiles by keywords, location, and title",
    schema: z.object({
      keywords: z.string(),
      location: z.string().optional(),
      title: z.string().optional(),
      limit: z.number().default(100),
    }),
  }
);
```

The schema serves two purposes:
1. Runtime validation
2. Model understanding (via description)

## The CLI

I built an interactive CLI for this agent:

```typescript
import { input } from "@inquirer/prompts";
import { HumanMessage } from "@langchain/core/messages";

export async function runInteractive() {
  let state = { messages: [], searchResults: [] };

  while (true) {
    const userInput = await input({ message: "You:" });

    if (userInput === "exit") break;

    // Add user message to state
    state.messages.push(new HumanMessage(userInput));

    // Run the graph
    const result = await agent.invoke(state);

    // Update state for next turn
    state = result;

    // Display response
    const lastMessage = result.messages.at(-1);
    console.log(`\nAgent: ${lastMessage.content}\n`);
  }
}
```

State persists across turns. The graph handles everything else.

## What I Learned

### 1. Explicit > Implicit

When I could see the state machine, debugging became trivial. "Why did this happen?" became "What state were we in, and what transition fired?"

### 2. Reducers Are Powerful

The reducer pattern for state updates is elegant. Different parts of state can have different update semantics.

### 3. Graphs Scale

Adding features means adding nodes and edges, not rewriting prompts. Human-in-the-loop? Add a node. Retries? Wrap a node.

### 4. TypeScript Helps

Type safety for state caught bugs at compile time that would have been runtime mysteries in Python.

## When to Use LangGraph

**Use LangGraph when:**
- You need visibility into agent execution
- You have complex conditional logic
- Reliability matters more than speed
- You're building in TypeScript

**Consider alternatives when:**
- You want rapid prototyping
- The flow is simple and linear
- You prefer Python

## The Full Picture

Here's the execution flow visualized:

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────┐     tool_calls?      ┌─────────┐
│  Agent  │──────────────────────▶│  Tools  │
│  Node   │                       │  Node   │
└────┬────┘◀──────────────────────└─────────┘
     │           always
     │ no tool_calls
     ▼
┌─────────┐
│   End   │
└─────────┘
```

Every execution follows this graph. No surprises.

## Try It

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd linkedin-to-sheets-export/agentic/langGraph
cp .env.example .env
bun install
bun run dev
```

---

*Building state-machine agents? I'd love to hear about your experience. Drop a comment or connect on LinkedIn.*
