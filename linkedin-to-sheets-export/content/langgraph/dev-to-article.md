---
title: Build a LinkedIn Export CLI Agent with LangGraph
published: true
description: Create a stateful AI agent using LangGraph's state machine architecture for LinkedIn data export
tags: typescript, langgraph, ai, cli
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/langgraph-linkedin-cli.png
canonical_url:
---

# Build a LinkedIn Export CLI Agent with LangGraph

LangGraph brings state machine thinking to AI agents. In this tutorial, we'll build a CLI-based agent that searches LinkedIn and exports results using TypeScript.

## What We're Building

A LangGraph agent that:
- Runs as an interactive CLI
- Searches LinkedIn profiles
- Exports to Google Sheets or JSON
- Uses stateful workflows for reliability

## Why LangGraph?

LangGraph excels at:
- **State Management**: Explicit state transitions
- **Complex Flows**: Conditional routing and loops
- **Error Recovery**: Built-in retry and fallback
- **TypeScript**: First-class TS support

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- ConnectSafely.ai API token
- Google Gemini API key
- Google Sheets credentials (optional)

## Project Structure

```
langGraph/
├── index.ts              # CLI entry point
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── agents/
│   ├── linkedin-export-agent.ts  # State graph
│   └── config/
│       ├── model.ts      # Gemini setup
│       ├── prompt.ts     # System prompt
│       └── call-model.ts # Model invocation
├── cli/
│   ├── index.ts          # CLI runner
│   ├── interactive.ts    # Interactive mode
│   └── display.ts        # Output formatting
└── tools/
    ├── index.ts          # Tool exports
    ├── types.ts          # TypeScript types
    ├── search-people.ts
    └── googlesheet/            # Google Sheets export module
        ├── auth.ts             # OAuth authentication
        ├── client.ts           # Google Sheets API client
        ├── schemas.ts          # Zod schemas & headers
        └── export-to-sheets.ts # Export tool
    └── export-to-json.ts
```

## Step 1: Setup

```bash
cd linkedin-to-sheets-export/agentic/langGraph
cp .env.example .env
# Add your API keys
bun install
```

## Step 2: Define Types

```typescript
// tools/types.ts
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export interface Person {
  profileUrl: string;
  profileId: string;
  fullName: string;
  headline: string;
  location: string;
  company: string;
  connectionDegree: string;
  isPremium: boolean;
  isOpenToWork: boolean;
}

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),
  searchResults: Annotation<Person[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
});

export type AgentStateType = typeof AgentState.State;
```

## Step 3: Create Tools

LangGraph tools use Zod schemas:

```typescript
// tools/search-people.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const searchPeopleTool = tool(
  async ({ keywords, location, title, limit }) => {
    const token = process.env.CONNECTSAFELY_API_TOKEN;

    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords, location, title, limit }),
      }
    );

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;
    const people = result?.people || [];

    const formatted = people.map((p: any) => ({
      profileUrl: p.profileUrl || "",
      fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      headline: p.headline || "",
      location: p.location || "",
      company: extractCompany(p.headline || ""),
    }));

    return JSON.stringify({
      success: true,
      people: formatted,
      count: formatted.length,
    });
  },
  {
    name: "search-people",
    description: "Search for LinkedIn profiles by keywords, location, and title",
    schema: z.object({
      keywords: z.string().describe("Search terms"),
      location: z.string().optional().describe("Geographic filter"),
      title: z.string().optional().describe("Job title filter"),
      limit: z.number().default(100).describe("Max results"),
    }),
  }
);

function extractCompany(headline: string): string {
  const match = headline.match(/(?:at|@|-)\s*([^|]+?)(?:\s*\||$)/i);
  return match ? match[1].trim() : "";
}
```

## Step 4: Export Tools

The export tool is modularized into separate files:

```typescript
// tools/googlesheet/auth.ts
export async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}
```

```typescript
// tools/googlesheet/export-to-sheets.ts
import { tool } from "@langchain/core/tools";
import { GoogleSheetsClient } from "./client.js";
import { exportToSheetsSchema } from "./schemas.js";

export const exportToSheetsTool = tool(
  async ({ people, spreadsheetId, spreadsheetTitle, sheetName }) => {
    const client = new GoogleSheetsClient();
    // Uses OAuth authentication
    // Handles spreadsheet creation and duplicate detection
  },
  {
    name: "export-to-sheets",
    description: "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
    schema: exportToSheetsSchema,
  }
);
```

## Step 5: Build the State Graph

```typescript
// agents/linkedin-export-agent.ts
import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "../tools/types.js";
import { callModel, shouldContinue } from "./config/call-model.js";
import {
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
} from "../tools/index.js";

const tools = [searchPeopleTool, exportToSheetsTool, exportToJsonTool];
const toolNode = new ToolNode(tools);

const workflow = new StateGraph(AgentState)
  // Add nodes
  .addNode("agent", callModel)
  .addNode("tools", toolNode)

  // Define edges
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })
  .addEdge("tools", "agent");

export const linkedInExportAgent = workflow.compile();
```

## Step 6: Model Configuration

```typescript
// agents/config/call-model.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";
import type { AgentStateType } from "../../tools/types.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.1,
}).bindTools([searchPeopleTool, exportToSheetsTool, exportToJsonTool]);

export async function callModel(state: AgentStateType) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...state.messages,
  ];

  const response = await model.invoke(messages);
  return { messages: [response] };
}

export function shouldContinue(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "end";
}
```

## Step 7: CLI Interface

```typescript
// cli/interactive.ts
import { input } from "@inquirer/prompts";
import { linkedInExportAgent } from "../agents/linkedin-export-agent.js";
import { HumanMessage } from "@langchain/core/messages";
import { displayResponse, displayWelcome } from "./display.js";

export async function runInteractive() {
  displayWelcome();

  let state = { messages: [], searchResults: [] };

  while (true) {
    const userInput = await input({
      message: "You:",
      theme: { prefix: "" },
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("\nGoodbye!");
      break;
    }

    state.messages.push(new HumanMessage(userInput));

    console.log("\nAgent thinking...\n");

    const result = await linkedInExportAgent.invoke(state);
    state = result;

    const lastMessage = result.messages[result.messages.length - 1];
    displayResponse(lastMessage.content);
  }
}
```

## Step 8: Entry Point

```typescript
// index.ts
import "dotenv/config";
import { runInteractive } from "./cli/index.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log("\nLinkedIn Export Agent (LangGraph)\n");
    console.log("Usage: bun run dev\n");
    return;
  }

  await runInteractive();
}

main().catch(console.error);
```

## Step 9: Run

```bash
bun run dev
```

## Example Session

```
LinkedIn Export Agent (LangGraph)
================================

You: Search for 25 CTOs in Seattle

Agent thinking...

Found 23 profiles matching "CTOs in Seattle":

1. Alex Kim - CTO at CloudTech Inc
2. Maria Santos - Chief Technology Officer at StartupXYZ
3. David Park - CTO & Co-founder at AI Dynamics
...

You: Export those to Google Sheets

Agent thinking...

Successfully exported 23 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/1abc123...

You: exit

Goodbye!
```

## Key LangGraph Patterns

### 1. State Annotations

Define state with reducers:

```typescript
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),  // Append messages
    default: () => [],
  }),
});
```

### 2. Conditional Edges

Route based on state:

```typescript
.addConditionalEdges("agent", shouldContinue, {
  tools: "tools",
  end: "__end__",
})
```

### 3. Tool Node

Built-in tool execution:

```typescript
const toolNode = new ToolNode(tools);
workflow.addNode("tools", toolNode);
```

## Extending the Agent

### Add Retries

```typescript
import { retry } from "@langchain/langgraph";

const robustToolNode = retry(toolNode, { maxAttempts: 3 });
```

### Add Human-in-the-Loop

```typescript
workflow.addNode("human_review", async (state) => {
  const approved = await askForApproval(state);
  return { ...state, approved };
});
```

## Troubleshooting

**"Tool not found"**
- Check tool is in the tools array
- Verify tool name matches schema

**State not updating**
- Ensure reducer is defined correctly
- Check you're returning state from nodes

**Gemini rate limits**
- Add delays between requests
- Use gemini-2.0-flash for faster responses

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [ConnectSafely.ai API](https://connectsafely.ai/docs)
- [Full Source Code](https://github.com/ConnectSafelyAI/agentic-framework-examples/tree/main/linkedin-to-sheets-export/agentic/langGraph)

---

*Questions? Drop them in the comments!*
