# LinkedIn to Sheets Export - Mastra Implementation

Export LinkedIn search results to Google Sheets using Mastra and ConnectSafely.ai.

## Overview

This implementation uses Mastra's agent orchestration framework with built-in memory and storage. The agent handles natural language commands through Mastra's web UI.

## Key Features

- **Mastra UI** - Built-in web interface for agent interaction
- **Agent Orchestration** - Simple configuration-based setup
- **Built-in Memory** - LibSQL storage for persistence
- **Dual Export** - Google Sheets and JSON support

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- ConnectSafely.ai API token
- Google Gemini API key
- Google Sheets credentials (optional)

### Installation

```bash
# Clone and navigate
cd linkedin-to-sheets-export/agentic/mastra

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# CONNECTSAFELY_API_TOKEN=your_token
# GOOGLE_GENERATIVE_AI_API_KEY=your_key
# GOOGLE_SHEETS_CREDENTIALS_FILE=/path/to/creds.json
# GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id

# Install dependencies
bun install

# Run the application
bun run dev
```

This starts Mastra's development server with a web UI.

### Environment Variables

| Variable                        | Required | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| CONNECTSAFELY_API_TOKEN         | Yes      | ConnectSafely.ai API token           |
| GOOGLE_GENERATIVE_AI_API_KEY    | Yes      | Google Gemini API key                |
| GOOGLE_SHEETS_CREDENTIALS_FILE  | No       | Path to service account JSON         |
| GOOGLE_SHEETS_SPREADSHEET_ID    | No       | Default spreadsheet ID               |

## How to Use

### Mastra UI

1. Run `bun run dev` to start the development server
2. Open the Mastra UI in your browser (typically http://localhost:4111)
3. Select the "LinkedIn to Sheets Export Agent"
4. Start chatting with the agent

### Example Commands

```
# Search commands
"Search for 50 CEOs in United States"
"Find software engineers in San Francisco with title 'Senior'"
"Search for 100 Marketing Directors"

# Export commands
"Export to Google Sheets"
"Save results to JSON file"
"Export to both Sheets and JSON"
```

## Architecture

```
mastra/
├── index.ts                    # Mastra configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
├── agents/
│   ├── linkedin-export-agent.ts  # Agent definition
│   └── instructions.ts           # Agent system prompt
├── tools/
│   ├── index.ts                  # Tool exports
│   ├── types.ts                  # TypeScript types
│   ├── search-geo-location.ts    # Location search
│   ├── search-people.ts          # People search
│   ├── export-to-sheets.ts       # Sheets export
│   └── export-to-json.ts         # JSON export
└── assets/
```

## Agent Configuration

The agent is defined in `agents/linkedin-export-agent.ts`:

```typescript
export const linkedInExportAgent = new Agent({
  name: "LinkedIn to Sheets Export Agent",
  model: "google/gemini-3-flash-preview",
  instructions: linkedInExportAgentInstructions,
  tools: {
    searchGeoLocationTool,
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

## Mastra Entry Point

The main configuration in `index.ts`:

```typescript
export const mastra = new Mastra({
  agents: { linkedInExportAgent },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({ name: "Mastra", level: "info" }),
  telemetry: { enabled: false },
  observability: { default: { enabled: true } },
});
```

## Available Tools

All tools use Mastra's `createTool` function:

### search-geo-location

```typescript
export const searchGeoLocationTool = createTool({
  id: "search-geo-location",
  description: "Search for geographic locations...",
  inputSchema: z.object({
    keywords: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    locations: z.array(...).optional(),
  }),
  execute: async ({ context }) => {
    // Implementation
  },
});
```

### search-people

```typescript
export const searchPeopleTool = createTool({
  id: "search-people",
  description: "Search for LinkedIn profiles...",
  inputSchema: z.object({
    keywords: z.string(),
    location: z.string().optional(),
    title: z.string().optional(),
    limit: z.number().default(100),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    people: z.array(...).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context }) => {
    // Implementation
  },
});
```

### export-to-sheets

```typescript
export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description: "Export results to Google Sheets...",
  inputSchema: z.object({
    people: z.array(personSchema),
    spreadsheetId: z.string().optional(),
    sheetName: z.string().default("Sheet1"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    rowsExported: z.number().optional(),
    spreadsheetUrl: z.string().optional(),
  }),
  execute: async ({ context }) => {
    // Implementation
  },
});
```

### export-to-json

```typescript
export const exportToJsonTool = createTool({
  id: "export-to-json",
  description: "Export results to JSON file...",
  inputSchema: z.object({
    people: z.array(personSchema),
    outputDir: z.string().optional(),
    filename: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    filePath: z.string().optional(),
    recordsExported: z.number().optional(),
  }),
  execute: async ({ context }) => {
    // Implementation
  },
});
```

## Memory and Storage

Mastra uses LibSQL for persistent memory:

```typescript
memory: new Memory({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
}),
```

This creates a `mastra.db` file in your project directory that persists conversation history and context.

## Troubleshooting

### Common Issues

**"Cannot find module '@mastra/core'"**
- Run `bun install` to install dependencies
- Ensure you're using Bun, not Node.js

**Mastra UI not loading**
- Check if port 4111 is available
- Try restarting the dev server

**Tool execution errors**
- Verify all API tokens are valid
- Check the Mastra logs for detailed errors

**Google Sheets export fails**
- Ensure googleapis is installed: `bun add googleapis`
- Verify service account credentials
- Share spreadsheet with service account email

### Viewing Logs

Mastra uses Pino for logging. View detailed logs in the terminal where you ran `bun run dev`.

## Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [LibSQL Documentation](https://docs.turso.tech/libsql)
