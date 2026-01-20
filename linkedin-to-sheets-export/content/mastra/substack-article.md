# Mastra: Zero to Agent in 15 Minutes

## This week: The minimalist approach to AI agent development

---

Happy Friday!

This week we're wrapping up our LinkedIn export agent series with Mastra—the framework that asks "what if agents were just config?"

If you've been following along, you've seen AutoGen's modularity, CrewAI's task orientation, and LangGraph's state machines.

Mastra takes a different approach: radical simplicity.

---

## The Mastra Philosophy

Most frameworks give you building blocks and say "assemble."

Mastra gives you a form and says "fill in the blanks."

Here's a complete agent:

```typescript
const agent = new Agent({
  name: "My Agent",
  model: "google/gemini-2.0-flash",
  instructions: "You help with X. Use tool-a for Y.",
  tools: { toolA, toolB },
  memory: new Memory({ storage: new LibSQLStore({ url: "file:./db" }) }),
});
```

That's it. Agent with memory, tools, and instructions.

---

## Building the LinkedIn Export Agent

Let's see how this plays out in practice.

### Step 1: Create Tools

Tools use `createTool` with Zod schemas:

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchPeopleTool = createTool({
  id: "search-people",
  description: "Search LinkedIn profiles by keywords and location",

  inputSchema: z.object({
    keywords: z.string().describe("Search terms"),
    location: z.string().optional().describe("Location filter"),
    limit: z.number().default(100).describe("Max results"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    people: z.array(z.object({
      fullName: z.string(),
      headline: z.string(),
      location: z.string(),
      profileUrl: z.string(),
    })).optional(),
    count: z.number().optional(),
    error: z.string().optional(),
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
    const result = Array.isArray(data) ? data[0] : data;
    const people = (result?.people || []).map((p: any) => ({
      fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      headline: p.headline || "",
      location: p.location || "",
      profileUrl: p.profileUrl || "",
    }));

    return { success: true, people, count: people.length };
  },
});
```

### Step 2: Create Export Tools

```typescript
export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description: "Export profiles to Google Sheets",

  inputSchema: z.object({
    people: z.array(personSchema),
    spreadsheetId: z.string().optional(),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    rowsExported: z.number().optional(),
    spreadsheetUrl: z.string().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    const { people, spreadsheetId } = context;
    // Automatically creates spreadsheet if ID not provided
    // Uses OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

    // Uses OAuth authentication via getAccessToken()
    // Modular structure: googleSheetsAuth.ts handles token refresh
    // googleSheetsClient.ts handles API operations

    const rows = people.map((p) => [
      p.profileUrl,
      p.fullName,
      p.headline,
      p.location,
      new Date().toISOString(),
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    return {
      success: true,
      rowsExported: rows.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    };
  },
});

export const exportToJsonTool = createTool({
  id: "export-to-json",
  description: "Export profiles to a JSON file",

  inputSchema: z.object({
    people: z.array(personSchema),
    filename: z.string().optional(),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    filePath: z.string().optional(),
    recordsExported: z.number().optional(),
  }),

  execute: async ({ context }) => {
    const { people, filename } = context;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const finalFilename = filename || `linkedin-export-${timestamp}.json`;

    const exportData = {
      exportedAt: new Date().toISOString(),
      count: people.length,
      people,
    };

    fs.writeFileSync(finalFilename, JSON.stringify(exportData, null, 2));

    return {
      success: true,
      filePath: finalFilename,
      recordsExported: people.length,
    };
  },
});
```

### Step 3: Define the Agent

```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const linkedInExportAgent = new Agent({
  name: "LinkedIn to Sheets Export Agent",

  model: "google/gemini-2.0-flash",

  instructions: `You are a LinkedIn Export Assistant.

## Your Tools
- search-people: Find LinkedIn profiles by keywords, location, title
- export-to-sheets: Save results to Google Sheets
- export-to-json: Save results to local JSON file

## How to Help
1. When users want to search, use search-people
2. Summarize results with count and examples
3. When users want to export, ask where (Sheets or JSON)
4. Confirm the export with count and destination

Remember previous results so users can say "export those" without specifying again.`,

  tools: {
    searchPeopleTool,
    exportToSheetsTool,
    exportToJsonTool,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra.db",
    }),
  }),
});
```

### Step 4: Configure Mastra

```typescript
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { linkedInExportAgent } from "./agents/linkedin-export-agent.js";

export const mastra = new Mastra({
  agents: { linkedInExportAgent },

  storage: new LibSQLStore({
    url: ":memory:",
  }),

  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),

  observability: {
    default: { enabled: true },
  },
});
```

### Step 5: Run

```bash
bun run dev
```

Open the Mastra UI (http://localhost:4111), select your agent, done.

---

## What You Get for Free

### Built-in UI

No React. No HTML. Just `bun run dev`.

### Memory

Conversations persist automatically. Previous results are available for follow-ups.

### Logging

Every action is logged. See exactly what your agent is doing.

### Type Safety

Full TypeScript support. Schemas validate at runtime.

---

## Example Session

In the Mastra UI:

```
You: Find 25 software engineers in Austin, Texas

Agent: I found 23 software engineers in Austin:

1. Alex Chen - Senior Software Engineer at TechCorp
2. Maria Rodriguez - Staff Engineer at StartupXYZ
3. David Kim - Principal Engineer at AI Labs
...

Would you like me to export these results?

You: Yes, to Google Sheets

Agent: Done! Exported 23 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/1abc123...
```

---

## Comparing the Frameworks

After building the same agent in four frameworks:

| Framework | Lines of Code | Setup Time | Best For |
|-----------|---------------|------------|----------|
| AutoGen | ~400 | 2-3 hours | Modular, extensible systems |
| CrewAI | ~300 | 1-2 hours | Task-oriented workflows |
| LangGraph | ~350 | 2-3 hours | Complex stateful flows |
| Mastra | ~200 | 30-60 min | Quick deployment |

Mastra wins on simplicity. The others win on flexibility.

---

## When to Choose Mastra

**Choose Mastra when:**
- You want to ship fast
- The flow is straightforward (search → export)
- Built-in memory is sufficient
- You don't need multi-agent orchestration

**Choose something else when:**
- You need complex conditional logic
- You want fine-grained control
- You're building multi-agent systems
- You need custom state management

---

## The Takeaway

There's no "best" agent framework. There's only the right tool for the job.

For a LinkedIn export agent:
- **Mastra** gets you running fastest
- **LangGraph** gives you most control
- **CrewAI** fits if you think in tasks
- **AutoGen** works for enterprise-scale systems

Pick based on your constraints, not the hype.

---

## Full Series

- Week 1: AutoGen - Modular architecture
- Week 2: CrewAI - Task-oriented approach
- Week 3: LangGraph - State machines
- Week 4: Mastra - Minimal configuration (this week)

All code is on GitHub:
```
github.com/ConnectSafelyAI/agentic-framework-examples/linkedin-to-sheets-export
```

---

*Thanks for following along! What should I build next? Reply with ideas.*
