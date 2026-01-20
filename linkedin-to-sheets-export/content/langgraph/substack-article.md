# LangGraph: State Machines for AI Agents

## This week: Building reliable agents with explicit state and transitions

---

Happy Friday!

This week we're diving into LangGraph—LangChain's framework for building stateful, graph-based AI agents.

If you've ever wondered "why did my agent do that?", LangGraph's explicit state machines are the answer.

Let's build a LinkedIn export agent to see how it works.

---

## The LangGraph Mental Model

Most agent frameworks are black boxes:
- Input → ??? → Output

LangGraph makes everything visible:
- Input → State A → Transition → State B → ... → Output

You define:
1. **What states exist** (nodes)
2. **How to move between them** (edges)
3. **When to move** (conditions)

This visibility is LangGraph's superpower.

---

## The LinkedIn Export Agent

We're building a CLI agent that:
- Searches LinkedIn profiles
- Exports to Google Sheets or JSON
- Maintains state across commands

---

## Step 1: Define State

State is the foundation. Define it explicitly:

```typescript
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Define what state looks like
export const AgentState = Annotation.Root({
  // Conversation history - accumulates
  messages: Annotation<BaseMessage[]>({
    reducer: (existing, incoming) => existing.concat(incoming),
    default: () => [],
  }),

  // Search results - replaces
  searchResults: Annotation<Person[]>({
    reducer: (_, incoming) => incoming,
    default: () => [],
  }),
});

// TypeScript type for the state
export type AgentStateType = typeof AgentState.State;
```

Key insight: **reducers define how state updates**.

- `messages`: New messages get appended to existing ones
- `searchResults`: New results replace old ones

---

## Step 2: Create Tools

LangGraph tools use Zod for schema validation:

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
        body: JSON.stringify({
          keywords,
          location,
          title,
          limit: Math.min(limit, 100),
        }),
      }
    );

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;
    const people = result?.people || [];

    // Format for export
    const formatted = people.map((p: any) => ({
      profileUrl: p.profileUrl || "",
      fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      headline: p.headline || "",
      location: p.location || "",
    }));

    return JSON.stringify({
      success: true,
      people: formatted,
      count: formatted.length,
    });
  },
  {
    name: "search-people",
    description: "Search for LinkedIn profiles",
    schema: z.object({
      keywords: z.string().describe("Search terms like 'CEO SaaS'"),
      location: z.string().optional().describe("Location filter"),
      title: z.string().optional().describe("Job title filter"),
      limit: z.number().default(100).describe("Max results"),
    }),
  }
);
```

The schema does double duty:
1. Validates inputs at runtime
2. Tells the model what parameters mean

---

## Step 3: Build the Graph

Here's where LangGraph shines:

```typescript
import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// Create tool node from our tools
const tools = [searchPeopleTool, exportToSheetsTool, exportToJsonTool];
const toolNode = new ToolNode(tools);

// Build the graph
const workflow = new StateGraph(AgentState)
  // Add nodes (states)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)

  // Add edges (transitions)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })
  .addEdge("tools", "agent");

// Compile to runnable
export const linkedInExportAgent = workflow.compile();
```

The graph:
```
Start → Agent → [tools or end]
         ↑           ↓
         └───── Tools ┘
```

---

## Step 4: The Agent Node

The agent node calls the model:

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";

// Model with tools bound
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.1,
}).bindTools(tools);

// Agent node function
async function callModel(state: AgentStateType) {
  const systemMessage = {
    role: "system",
    content: `You are a LinkedIn Export Assistant.
Use search-people to find profiles.
Use export-to-sheets or export-to-json to export results.
Always summarize results clearly.`,
  };

  const response = await model.invoke([systemMessage, ...state.messages]);

  return { messages: [response] };
}

// Routing function
function shouldContinue(state: AgentStateType): "tools" | "end" {
  const lastMessage = state.messages.at(-1);

  if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
    return "tools"; // Agent wants to use tools
  }

  return "end"; // Agent is done
}
```

No magic. The routing logic is explicit and testable.

---

## Step 5: The CLI

```typescript
import { input } from "@inquirer/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { linkedInExportAgent } from "../agents/linkedin-export-agent.js";

export async function runInteractive() {
  console.log("\n🔗 LinkedIn Export Agent (LangGraph)");
  console.log("================================\n");
  console.log("Type 'exit' to quit.\n");

  // Initialize state
  let state = {
    messages: [],
    searchResults: [],
  };

  while (true) {
    const userInput = await input({
      message: "You:",
      theme: { prefix: "" },
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("\nGoodbye!");
      break;
    }

    // Add user message
    state.messages.push(new HumanMessage(userInput));

    console.log("\n⏳ Thinking...\n");

    // Run the graph
    const result = await linkedInExportAgent.invoke(state);

    // Update state for next turn
    state = result;

    // Display response
    const lastMessage = result.messages.at(-1);
    console.log(`Agent: ${lastMessage.content}\n`);
  }
}
```

State persists between turns. The graph handles everything.

---

## Running It

```bash
cd linkedin-to-sheets-export/agentic/langGraph
cp .env.example .env
# Add your API keys
bun install
bun run dev
```

---

## Example Session

```
🔗 LinkedIn Export Agent (LangGraph)
================================

Type 'exit' to quit.

You: Find 20 CTOs in Austin, Texas

⏳ Thinking...

Agent: I found 18 CTOs in Austin:

1. James Wilson - CTO at TechStartup
2. Sarah Martinez - Chief Technology Officer at DataCo
3. Michael Chen - CTO & Co-founder at AI Labs
...

Would you like me to export these results?

You: Yes, to Google Sheets

⏳ Thinking...

Agent: Done! Exported 18 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/1abc123...

You: exit

Goodbye!
```

---

## Why This Works

### Explicit Transitions

I know exactly when tools get called:
- Agent produces tool_calls → go to Tools node
- Agent produces content → finish

### Testable Components

Each piece is isolated:
- Test `callModel` by passing mock state
- Test `shouldContinue` with different message types
- Test tools independently

### Debuggable Execution

When something goes wrong:
1. What state were we in?
2. What did the last node return?
3. Which transition fired?

No guessing.

---

## Extending the Graph

### Add Human Approval

```typescript
workflow
  .addNode("human_approval", async (state) => {
    const approved = await askUser("Proceed with export?");
    return { ...state, approved };
  })
  .addConditionalEdges("agent", (state) => {
    if (needsApproval(state)) return "human_approval";
    return shouldContinue(state);
  });
```

### Add Retries

```typescript
import { retry } from "@langchain/langgraph";

const toolNodeWithRetry = retry(toolNode, {
  maxAttempts: 3,
  delay: 1000,
});
```

### Add Logging

```typescript
workflow.addNode("log", (state) => {
  console.log("State:", JSON.stringify(state, null, 2));
  return state;
});
```

---

## When to Use LangGraph

**Great for:**
- Complex multi-step workflows
- When you need visibility
- Production systems requiring reliability
- TypeScript projects

**Consider alternatives for:**
- Quick prototypes
- Simple linear flows
- When you prefer Python

---

## Next Week

We'll look at Mastra—the simplest way to get an agent running with minimal configuration.

---

*Questions about LangGraph? Reply to this email.*
