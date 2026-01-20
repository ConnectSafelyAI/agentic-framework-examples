---
title: The Fastest Way to Build AI Agents: LinkedIn Export with Mastra
published: true
description: Build a LinkedIn data export agent in minutes using Mastra's configuration-driven approach
tags: typescript, mastra, ai, automation
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mastra-linkedin-export.png
canonical_url:
---

# The Fastest Way to Build AI Agents: LinkedIn Export with Mastra

Mastra is the new kid on the block for AI agent frameworks. Its pitch? Get agents running with minimal configuration.

Let's see if it delivers by building a LinkedIn export agent.

## What We're Building

A Mastra agent that:
- Searches LinkedIn profiles via natural language
- Exports to Google Sheets or JSON
- Uses built-in memory for context
- Runs through Mastra's web UI

## Why Mastra?

Mastra's advantages:
- **Minimal Config**: Define agents in a few lines
- **Built-in UI**: No need to build interfaces
- **Memory Included**: LibSQL storage out of the box
- **Observability**: See what your agent is doing

## Prerequisites

- [Bun](https://bun.sh/) runtime
- ConnectSafely.ai API token
- Google Gemini API key
- Google OAuth credentials (optional, for Sheets export)

## Project Structure

```
mastra/
├── index.ts              # Mastra configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── agents/
│   ├── linkedin-export-agent.ts  # Agent definition
│   └── instructions.ts           # System prompt
└── tools/
    ├── index.ts          # Tool exports
    ├── types.ts          # TypeScript types
    ├── search-people.ts
    ├── export-to-json.ts
    └── googleSheet/      # Google Sheets export module
        ├── googleSheetsAuth.ts   # OAuth authentication
        ├── googleSheetsClient.ts # Google Sheets API client
        ├── schemas.ts            # Zod schemas & headers
        └── export-to-sheets.ts   # Export tool
```

## Step 1: Setup

```bash
cd linkedin-to-sheets-export/agentic/mastra
cp .env.example .env
# Add your API keys
bun install
```

## Step 2: Create Tools

Mastra tools use `createTool`:

```typescript
// tools/search-people.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchPeopleTool = createTool({
  id: "search-people",
  description: "Search for LinkedIn profiles by keywords, location, and title",

  inputSchema: z.object({
    keywords: z.string().describe("Search terms"),
    location: z.string().optional().describe("Location filter"),
    title: z.string().optional().describe("Job title filter"),
    limit: z.number().default(100).describe("Max results"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    people: z.array(z.object({
      profileUrl: z.string(),
      fullName: z.string(),
      headline: z.string(),
      location: z.string(),
    })).optional(),
    count: z.number().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    const { keywords, location, title, limit } = context;
    const token = process.env.CONNECTSAFELY_API_TOKEN;

    try {
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
      }));

      return {
        success: true,
        people: formatted,
        count: formatted.length,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  },
});
```

## Step 3: Export Tools

The export tool is modularized into separate files:

```typescript
// tools/googleSheet/googleSheetsAuth.ts
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
// tools/googleSheet/googleSheetsClient.ts
import { getAccessToken } from "./googleSheetsAuth.js";

export class GoogleSheetsClient {
  private baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";

  async createSpreadsheet(title: string, sheetName: string, headers: string[]) {
    const accessToken = await getAccessToken();
    // Creates spreadsheet and adds headers
  }

  async appendRows(spreadsheetId: string, sheetName: string, rows: any[][]) {
    const accessToken = await getAccessToken();
    // Appends rows to spreadsheet
  }
}
```

```typescript
// tools/googleSheet/export-to-sheets.ts
import { createTool } from "@mastra/core/tools";
import { GoogleSheetsClient } from "./googleSheetsClient.js";
import { inputSchema, outputSchema, HEADERS } from "./schemas.js";

export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description: "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const client = new GoogleSheetsClient();
    // Uses OAuth authentication
    // Handles spreadsheet creation and duplicate detection
  },
});
```

## Step 4: Define the Agent

This is where Mastra shines—minimal configuration:

```typescript
// agents/linkedin-export-agent.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import {
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
} from "../tools/index.js";
// exportToSheetsTool is imported from tools/googleSheet/export-to-sheets.ts
import { linkedInExportAgentInstructions } from "./instructions.js";

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
    storage: new LibSQLStore({
      url: "file:./mastra.db",
    }),
  }),
});
```

That's it. Agent defined.

## Step 5: Agent Instructions

```typescript
// agents/instructions.ts
export const linkedInExportAgentInstructions = `
You are a LinkedIn Export Assistant that helps users search for LinkedIn profiles and export the results.

## Your Capabilities

1. **Search Profiles**: Use the search-people tool to find LinkedIn profiles
   - Search by keywords (e.g., "CEO SaaS", "Software Engineer")
   - Filter by location (e.g., "San Francisco", "United States")
   - Filter by job title (e.g., "Head of Growth")

2. **Export to Sheets**: Use export-to-sheets to save results to Google Sheets
   - Results are appended to the spreadsheet
   - Includes timestamp for each export

3. **Export to JSON**: Use export-to-json to save results locally
   - Creates a timestamped JSON file

## Guidelines

- When searching, always summarize results with count and examples
- When exporting, confirm the destination and count
- Remember previous results for follow-up commands like "export those"
- Ask for clarification if requests are ambiguous
`;
```

## Step 6: Mastra Configuration

```typescript
// index.ts
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

  telemetry: {
    enabled: false,
  },

  observability: {
    default: { enabled: true },
  },
});
```

## Step 7: Run

```bash
bun run dev
```

This starts Mastra's development server with a built-in web UI.

## Using Mastra UI

1. Open the Mastra UI (typically http://localhost:4111)
2. Select "LinkedIn to Sheets Export Agent"
3. Start chatting:

```
You: Search for 30 marketing directors in Chicago

Agent: I found 28 marketing directors in Chicago:

1. Sarah Johnson - Marketing Director at TechCorp
2. Michael Chen - Director of Marketing at StartupXYZ
...

Would you like me to export these results?

You: Yes, to Google Sheets

Agent: Exported 28 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/...
```

## Key Mastra Patterns

### 1. Simple Tool Definition

```typescript
createTool({
  id: "tool-name",
  description: "What it does",
  inputSchema: z.object({ ... }),
  outputSchema: z.object({ ... }),
  execute: async ({ context }) => { ... },
});
```

### 2. Agent with Memory

```typescript
new Agent({
  name: "Agent Name",
  model: "google/gemini-2.0-flash",
  instructions: "...",
  tools: { ... },
  memory: new Memory({
    storage: new LibSQLStore({ url: "file:./db.sqlite" }),
  }),
});
```

### 3. Mastra Entry Point

```typescript
new Mastra({
  agents: { myAgent },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({ name: "App", level: "info" }),
});
```

## Extending the Agent

### Add More Tools

Just add them to the tools object:

```typescript
tools: {
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
  enrichEmailTool,  // New tool
},
```

### Custom Storage

Use a persistent database:

```typescript
storage: new LibSQLStore({
  url: "file:./production.db",
}),
```

### Add Workflows

Mastra supports workflows for complex multi-step processes:

```typescript
import { Workflow } from "@mastra/core/workflow";

const exportWorkflow = new Workflow({
  name: "bulk-export",
  steps: [
    { tool: searchPeopleTool },
    { tool: exportToSheetsTool },
  ],
});
```

## Troubleshooting

**UI not loading**
- Check port 4111 is available
- Look at terminal for errors

**Tools not appearing**
- Verify tool is exported from index.ts
- Check for TypeScript errors

**Memory not persisting**
- Ensure database path is writable
- Use `file:./path` not just `./path`

## Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [ConnectSafely.ai API](https://connectsafely.ai/docs)
- [Full Source Code](https://github.com/ConnectSafelyAI/agentic-framework-examples/tree/main/linkedin-to-sheets-export/agentic/mastra)

---

*Questions? Drop them in the comments!*
