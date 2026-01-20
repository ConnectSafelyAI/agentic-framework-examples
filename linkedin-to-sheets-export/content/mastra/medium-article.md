# Mastra: The Minimalist's Guide to AI Agents

## How I built a LinkedIn export agent with almost no configuration

---

I've been building AI agents for two years. In that time, I've watched frameworks get increasingly complex. More abstractions. More configuration. More "flexibility."

Then I found Mastra.

Mastra's philosophy is refreshingly simple: **what if building an agent was as easy as defining a config object?**

Let me show you what I mean.

---

## The Agent in 20 Lines

Here's a complete Mastra agent definition:

```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const linkedInExportAgent = new Agent({
  name: "LinkedIn Export Agent",
  model: "google/gemini-2.0-flash",
  instructions: `You help users search LinkedIn and export results.
Use search-people to find profiles.
Use export-to-sheets to save to Google Sheets.
Use export-to-json to save locally.`,
  tools: {
    searchPeopleTool,
    exportToSheetsTool,
    exportToJsonTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({ url: "file:./mastra.db" }),
  }),
});
```

That's it. Agent with memory, tools, and instructions.

No chains. No graphs. No complex orchestration.

---

## The Tools

Tools follow the same minimalist pattern:

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchPeopleTool = createTool({
  id: "search-people",
  description: "Search LinkedIn profiles",

  inputSchema: z.object({
    keywords: z.string(),
    location: z.string().optional(),
    limit: z.number().default(100),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    people: z.array(z.object({
      fullName: z.string(),
      headline: z.string(),
      location: z.string(),
    })).optional(),
    count: z.number().optional(),
  }),

  execute: async ({ context }) => {
    const { keywords, location, limit } = context;

    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords, location, limit }),
      }
    );

    const data = await response.json();
    const people = formatPeople(data);

    return { success: true, people, count: people.length };
  },
});
```

Define inputs, outputs, and execution. Mastra handles the rest.

---

## The Entry Point

```typescript
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { linkedInExportAgent } from "./agents/linkedin-export-agent.js";

export const mastra = new Mastra({
  agents: { linkedInExportAgent },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({ name: "Mastra", level: "info" }),
});
```

Run `bun run dev` and you have a working agent with a web UI.

---

## What Mastra Handles for You

### Memory

Out of the box, Mastra gives you:
- Conversation history
- Context persistence
- LibSQL storage (local SQLite or Turso cloud)

No configuration needed beyond the storage URL.

### UI

`bun run dev` starts a web interface where you can:
- Chat with your agent
- See tool calls
- View execution logs
- Switch between agents

I didn't write a single line of frontend code.

### Observability

Every agent action is logged:
- Model calls
- Tool executions
- Errors and retries

Enable with one flag: `observability: { default: { enabled: true } }`

---

## Building the LinkedIn Export Agent

Let me walk through the complete implementation.

### Project Structure

```
mastra/
├── index.ts              # Mastra config
├── package.json
├── agents/
│   ├── linkedin-export-agent.ts
│   └── instructions.ts
└── tools/
    ├── index.ts
    ├── search-people.ts
    ├── export-to-json.ts
    └── googleSheet/      # Google Sheets export module
        ├── googleSheetsAuth.ts
        ├── googleSheetsClient.ts
        ├── schemas.ts
        └── export-to-sheets.ts
```

### The Search Tool

```typescript
export const searchPeopleTool = createTool({
  id: "search-people",
  description: "Search for LinkedIn profiles by keywords, location, and title",

  inputSchema: z.object({
    keywords: z.string().describe("Search terms like 'CEO SaaS'"),
    location: z.string().optional().describe("Geographic filter"),
    title: z.string().optional().describe("Job title filter"),
    limit: z.number().default(100).describe("Max results"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    people: z.array(personSchema).optional(),
    count: z.number().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    const { keywords, location, title, limit } = context;

    try {
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
      const result = Array.isArray(data) ? data[0] : data;
      const people = result?.people || [];

      const formatted = people.map((p: any) => ({
        profileUrl: p.profileUrl || "",
        fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        headline: p.headline || "",
        location: p.location || "",
      }));

      return { success: true, people: formatted, count: formatted.length };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
});
```

### The Export Tool

The export tool is modularized into separate files for OAuth authentication and Google Sheets API operations:

```typescript
// tools/googleSheet/export-to-sheets.ts
import { createTool } from "@mastra/core/tools";
import { GoogleSheetsClient } from "./googleSheetsClient.js";

export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description: "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
  // Uses OAuth authentication via googleSheetsAuth.ts
  // Handles API calls via googleSheetsClient.ts
  // Includes duplicate detection and automatic spreadsheet creation
});
```

### The Agent

```typescript
export const linkedInExportAgent = new Agent({
  name: "LinkedIn to Sheets Export Agent",
  model: "google/gemini-2.0-flash",
  instructions: linkedInExportAgentInstructions,
  tools: {
    searchPeopleTool,
    exportToSheetsTool,
    exportToJsonTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({ url: "file:./mastra.db" }),
  }),
});
```

### Instructions

```typescript
export const linkedInExportAgentInstructions = `
You are a LinkedIn Export Assistant.

## Tools
- search-people: Find LinkedIn profiles
- export-to-sheets: Save to Google Sheets
- export-to-json: Save to local file

## Guidelines
- Summarize search results with count and examples
- Confirm export destination and count
- Remember previous results for follow-ups
`;
```

---

## Running It

```bash
bun install
bun run dev
```

Open the Mastra UI, select your agent, and start chatting.

---

## When to Use Mastra

**Use Mastra when:**
- You want to ship fast
- The agent flow is straightforward
- You need built-in memory and UI
- You prefer TypeScript

**Consider alternatives when:**
- You need complex multi-agent orchestration
- You want fine-grained execution control
- You need custom state management

---

## The Mastra Philosophy

Mastra bets that most agents don't need complex architecture.

Give them:
- Instructions
- Tools
- Memory

And let them figure it out.

For my LinkedIn export agent, that bet paid off. I went from idea to working agent in under an hour.

---

## Try It

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd linkedin-to-sheets-export/agentic/mastra
cp .env.example .env
bun install
bun run dev
```

---

*Building with Mastra? I'd love to see what you create. Connect with me on LinkedIn.*
