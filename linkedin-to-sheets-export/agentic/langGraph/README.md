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
- Google Sheets credentials (optional)

### Installation

```bash
# Clone and navigate
cd linkedin-to-sheets-export/agentic/langGraph

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

### Environment Variables

| Variable                        | Required | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| CONNECTSAFELY_API_TOKEN         | Yes      | ConnectSafely.ai API token           |
| GOOGLE_GENERATIVE_AI_API_KEY    | Yes      | Google Gemini API key                |
| GOOGLE_SHEETS_CREDENTIALS_FILE  | No       | Path to service account JSON         |
| GOOGLE_SHEETS_SPREADSHEET_ID    | No       | Default spreadsheet ID               |

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
│   ├── export-to-sheets.ts     # Sheets export
│   └── export-to-json.ts       # JSON export
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
  async ({ people, spreadsheetId, sheetName }) => {
    // Export to Google Sheets
  },
  {
    name: "export-to-sheets",
    schema: z.object({
      people: z.array(personSchema),
      spreadsheetId: z.string().optional(),
      sheetName: z.string().default("Sheet1"),
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
- Ensure googleapis package is installed: `bun add googleapis`
- Verify service account credentials path
- Share spreadsheet with service account email

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
