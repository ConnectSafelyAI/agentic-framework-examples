---
title: Build an AI Agent to Export LinkedIn Search Results to Google Sheets
published: true
description: Learn how to build an AI-powered agent that searches LinkedIn profiles and exports them to Google Sheets using four different agentic frameworks
tags: ai, python, typescript, automation
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/linkedin-sheets-export-cover.png
---

# Build an AI Agent to Export LinkedIn Search Results to Google Sheets

Ever spent hours manually searching LinkedIn and copying profile data into spreadsheets? What if an AI agent could do all that for you with a simple command like "Find 100 CEOs in the United States and export to Google Sheets"?

In this article, I'll show you how to build exactly that—an AI-powered agent that automates LinkedIn profile searching and Google Sheets export. We'll implement it using **four different agentic frameworks** so you can choose the one that fits your tech stack.

## The Problem

Building lead lists, candidate pipelines, or market research databases from LinkedIn is tedious:

- **Manual searching**: Hours browsing for the right profiles
- **Copy-paste nightmare**: Moving data into spreadsheets one by one
- **Inconsistent data**: Different formats and missing fields
- **Rate limiting risks**: Manual scraping can get your account restricted

## The Solution: An AI Agent

We'll build an agent that:

1. Understands natural language commands
2. Searches LinkedIn via [ConnectSafely.ai](https://connectsafely.ai) API (no scraping, platform-compliant)
3. Formats the data consistently
4. Exports directly to Google Sheets or JSON

## Four Framework Implementations

I've implemented this agent in four different frameworks:

| Framework | Language   | Interface     |
|-----------|------------|---------------|
| AutoGen   | Python     | Streamlit Web |
| CrewAI    | Python     | Streamlit Web |
| LangGraph | TypeScript | CLI           |
| Mastra    | TypeScript | Web UI        |

Let's look at each one!

## 1. AutoGen Implementation (Python)

AutoGen from Microsoft uses a modular architecture with a single assistant agent.

```python
# agents/assistant.py
from tools import search_people, export_to_sheets

class LinkedInExportAssistant:
    def __init__(self):
        self.tools = [
            search_people,
            export_to_sheets,
            export_to_json
        ]
        self.assistant = create_assistant_agent(
            api_key=os.getenv("GEMINI_API_KEY"),
            model="gemini-2.5-pro",
            tools=self.tools
        )

    async def execute_async(self, command: str):
        result = await self.assistant.run(task=command)
        return clean_response(result)
```

The Streamlit UI makes it easy to interact:

```python
# App.py
command = st.chat_input("Enter your command...")
if command:
    result = client.execute(command=command)
    st.markdown(result)
```

**Run it:**
```bash
cd autogen
uv sync
uv run streamlit run App.py
```

## 2. CrewAI Implementation (Python)

CrewAI uses a task-based approach with built-in memory:

```python
# agents/agents.py
from crewai import Agent, LLM
from crewai.tools import tool

@tool("Search LinkedIn People")
def search_people(keywords: str, location: str = None):
    """Search for LinkedIn profiles."""
    # API call to ConnectSafely.ai
    pass

agent = Agent(
    role="LinkedIn Export Specialist",
    goal="Search LinkedIn profiles and export results",
    tools=[search_people, export_to_sheets],
    llm=LLM(model="gemini/gemini-2.5-pro"),
    memory=True,
)
```

**Run it:**
```bash
cd crewai
uv sync
uv run streamlit run App.py
```

## 3. LangGraph Implementation (TypeScript)

LangGraph uses a state graph architecture for complex workflows:

```typescript
// agents/linkedin-export-agent.ts
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })
  .addEdge("tools", "agent");

export const linkedInExportAgent = workflow.compile();
```

Tools are defined with Zod schemas:

```typescript
// tools/search-people.ts
export const searchPeopleTool = tool(
  async ({ keywords, location, title, limit }) => {
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: JSON.stringify({ keywords, location, title, limit }),
      }
    );
    return JSON.stringify(await res.json());
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

**Run it:**
```bash
cd langGraph
bun install
bun run dev
```

## 4. Mastra Implementation (TypeScript)

Mastra offers the simplest configuration with built-in memory:

```typescript
// agents/linkedin-export-agent.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

export const linkedInExportAgent = new Agent({
  name: "LinkedIn to Sheets Export Agent",
  model: "google/gemini-3-flash-preview",
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

**Run it:**
```bash
cd mastra
bun install
bun run dev
```

## The ConnectSafely.ai API

All implementations use [ConnectSafely.ai](https://connectsafely.ai) for LinkedIn data access:

- **Platform-compliant**: No scraping, no ban risk
- **Bearer token auth**: Simple API key authentication
- **Rich data**: Full profile information
- **Rate limiting**: Built-in protection

Example API call:

```javascript
const response = await fetch(
  "https://api.connectsafely.ai/linkedin/search/people",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keywords: "CEO SaaS",
      location: "United States",
      title: "Head of Growth",
      limit: 100,
    }),
  }
);
```

## Setting Up Google Sheets Export

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account
4. Download the JSON credentials
5. Share your spreadsheet with the service account email

```bash
# .env
GOOGLE_SHEETS_CREDENTIALS_FILE=/path/to/credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

## Which Framework Should You Choose?

| If you want...                    | Choose    |
|-----------------------------------|-----------|
| Modular Python code               | AutoGen   |
| Task-based workflows              | CrewAI    |
| Complex stateful flows            | LangGraph |
| Quick setup with built-in UI      | Mastra    |

## Try It Yourself

The full source code is available on GitHub:

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd agentic-framework-examples/linkedin-to-sheets-export
```

Each framework has its own README with detailed setup instructions.

## What's Next?

This is just the beginning! You could extend this agent to:

- Schedule automated searches
- Filter results by company size or industry
- Add email enrichment
- Build automated outreach sequences

---

**Questions?** Drop them in the comments below!

**Found this useful?** Give it a ❤️ and share with your network.

**Want more AI agent tutorials?** Follow me for weekly updates!
