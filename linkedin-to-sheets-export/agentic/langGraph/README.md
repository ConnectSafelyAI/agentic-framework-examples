# LinkedIn to Sheets Export - LangGraph Implementation

Export LinkedIn search results to Google Sheets using LangGraph and ConnectSafely.ai.

## Overview

This implementation uses LangGraph's state graph architecture with a CLI interface. The agent uses stateful workflows to handle multi-step search and export operations.

## Key Features

- **CLI Interface** - Interactive command-line experience
- **State Graph Architecture** - Fine-grained control flow
- **TypeScript** - Type-safe implementation
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
cd linkedin-to-sheets-export/agentic/langGraph

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

### CLI Interface

```
╔══════════════════════════════════════════════════════════════╗
║     📊 LinkedIn to Google Sheets Export Agent (LangGraph)    ║
╚══════════════════════════════════════════════════════════════╝
Powered by ConnectSafely.ai

Type your commands or 'help' for examples. Type 'exit' to quit.

📝 You: Search for 50 CEOs in United States

⏳ Processing...

🤖 Assistant: Found 50 profiles matching your criteria...
```

### Available Commands

```
# Search commands
Search for 50 CEOs in United States
Find software engineers in San Francisco
Search for Marketing VPs with title "Director"

# Export commands
Export to Google Sheets
Export to JSON
Export to both formats

# Special commands
help  - Show help message
clear - Clear conversation history
exit  - Exit the application
```

## Architecture

```
langGraph/
├── index.ts                    # CLI entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
├── agents/
│   ├── linkedin-export-agent.ts  # StateGraph workflow
│   └── config/
│       ├── model.ts            # Gemini model config
│       ├── prompt.ts           # System prompt
│       └── call-model.ts       # Model invocation handler
├── cli/
│   ├── index.ts                # CLI entry point
│   ├── interactive.ts          # Interactive mode
│   ├── display.ts              # Display utilities
│   └── commands.ts             # Special command handlers
├── tools/
│   ├── index.ts                # Tool exports
│   ├── types.ts                # TypeScript types
│   ├── search-geo-location.ts  # Location search
│   ├── search-people.ts        # People search
│   ├── export-to-json.ts       # JSON export
│   └── googlesheet/            # Google Sheets export module
│       ├── auth.ts             # OAuth authentication
│       ├── client.ts           # Google Sheets API client
│       ├── schemas.ts          # Zod schemas & headers
│       └── export-to-sheets.ts # Export tool
└── assets/
```

## State Graph

The agent uses LangGraph's StateGraph for workflow management:

```typescript
const workflow = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })
  .addEdge("tools", "agent");
```

### State Schema

```typescript
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({...}),
  searchResults: Annotation<Person[]>({...}),
  searchParams: Annotation<SearchParams | null>({...}),
  lastExport: Annotation<ExportResult | null>({...}),
});
```

## Available Tools

### search-geo-location

```typescript
export const searchGeoLocationTool = tool(
  async ({ keywords }) => {
    // Convert location name to LinkedIn geo ID
  },
  {
    name: "search-geo-location",
    schema: z.object({
      keywords: z.string(),
    }),
  }
);
```

### search-people

```typescript
export const searchPeopleTool = tool(
  async ({ keywords, location, title, limit }) => {
    // Search for LinkedIn profiles
  },
  {
    name: "search-people",
    schema: z.object({
      keywords: z.string(),
      location: z.string().optional(),
      title: z.string().optional(),
      limit: z.number().default(100),
    }),
  }
);
```

### export-to-sheets

```typescript
export const exportToSheetsTool = tool(
  async ({ people, spreadsheetId, spreadsheetTitle, sheetName }) => {
    // Export to Google Sheets using OAuth
    // Automatically creates spreadsheet if ID not provided
    // Includes duplicate detection by Profile ID
  },
  {
    name: "export-to-sheets",
    schema: z.object({
      people: z.array(personSchema),
      spreadsheetId: z.string().optional(),
      spreadsheetTitle: z.string().optional(),
      sheetName: z.string().default("LinkedIn People"),
    }),
  }
);
```

### export-to-json

```typescript
export const exportToJsonTool = tool(
  async ({ people, outputDir, filename }) => {
    // Export to JSON file
  },
  {
    name: "export-to-json",
    schema: z.object({
      people: z.array(personSchema),
      outputDir: z.string().optional(),
      filename: z.string().optional(),
    }),
  }
);
```

## Troubleshooting

### Common Issues

**"Missing environment variables"**
- Check that .env file exists with all required keys
- Restart the application after updating .env

**Tool execution fails**
- Verify API tokens are valid
- Check network connectivity

**Google Sheets export fails**
- Verify OAuth credentials are set correctly in .env
- Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are valid
- Check that refresh token hasn't expired

### Debug Mode

Run with verbose output:

```bash
DEBUG=* bun run dev
```

## Learn More

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Google GenAI](https://js.langchain.com/docs/integrations/chat/google_generativeai)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
