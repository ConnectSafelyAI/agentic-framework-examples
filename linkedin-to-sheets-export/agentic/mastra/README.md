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
- Google OAuth credentials (optional, for Sheets export)

### Installation

```bash
# Clone and navigate
cd linkedin-to-sheets-export/agentic/mastra

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# CONNECTSAFELY_API_TOKEN=your_token
# GOOGLE_GENERATIVE_AI_API_KEY=your_key
# For Google Sheets export (optional):
# GOOGLE_CLIENT_ID=your_oauth_client_id
# GOOGLE_CLIENT_SECRET=your_oauth_client_secret
# GOOGLE_REFRESH_TOKEN=your_refresh_token

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
| GOOGLE_CLIENT_ID                | No       | Google OAuth client ID (for Sheets)  |
| GOOGLE_CLIENT_SECRET            | No       | Google OAuth client secret           |
| GOOGLE_REFRESH_TOKEN            | No       | Google OAuth refresh token           |

### Google OAuth Setup (Optional - for Sheets Export)

To enable Google Sheets export with OAuth authentication:

1. **Create OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop app" as application type
   - Download the credentials JSON

2. **Get Refresh Token**:
   - Use the OAuth client ID and secret to generate a refresh token
   - You can use tools like [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - Required scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive`

3. **Set Environment Variables**:
   - Add to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     GOOGLE_REFRESH_TOKEN=your_refresh_token
     ```

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
│   ├── export-to-json.ts         # JSON export
│   └── googleSheet/              # Google Sheets export module
│       ├── googleSheetsAuth.ts   # OAuth authentication
│       ├── googleSheetsClient.ts # Google Sheets API client
│       ├── schemas.ts            # Zod schemas & headers
│       └── export-to-sheets.ts   # Export tool
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
  description: "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
  inputSchema: z.object({
    people: z.array(personSchema),
    spreadsheetId: z.string().optional(),
    spreadsheetTitle: z.string().optional(),
    sheetName: z.string().default("LinkedIn People"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    spreadsheetId: z.string(),
    spreadsheetUrl: z.string(),
    spreadsheetTitle: z.string(),
    sheetName: z.string(),
    peopleAdded: z.number(),
    peopleSkipped: z.number(),
    isNewSheet: z.boolean(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Implementation using OAuth authentication
    // Automatically creates spreadsheet if ID not provided
    // Includes duplicate detection by Profile ID
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
- Verify OAuth credentials are set correctly in .env
- Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are valid
- Check that refresh token hasn't expired

### Viewing Logs

Mastra uses Pino for logging. View detailed logs in the terminal where you ran `bun run dev`.

## Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [LibSQL Documentation](https://docs.turso.tech/libsql)
