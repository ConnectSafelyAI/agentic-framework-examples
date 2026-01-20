# The Complete Guide to Building LinkedIn Data Export Agents

## How to automate profile searching and spreadsheet export using AI agents

---

Welcome to this week's deep-dive! Today we're building something practical: an AI agent that searches LinkedIn and exports results directly to Google Sheets.

No more manual copy-paste. No more inconsistent data. Just tell the agent what you want, and it handles the rest.

---

## Why This Matters

If you work in sales, recruiting, or market research, you probably spend hours every week:

- Searching LinkedIn for specific types of professionals
- Copying profile information into spreadsheets
- Cleaning and formatting the data
- Doing it all over again next week

This is exactly the kind of repetitive, well-defined task that AI agents excel at. And with the right architecture, you can build one in an afternoon.

---

## The Architecture

Our agent has four main components:

### 1. Natural Language Interface
The agent understands commands like "Find 100 marketing directors in New York and export to Google Sheets."

### 2. Tool System
The agent has access to specific tools:
- `search_people`: Searches LinkedIn profiles
- `export_to_sheets`: Exports to Google Sheets
- `export_to_json`: Exports to local files

### 3. Memory
The agent remembers previous searches so you can say "export those results" without specifying which results.

### 4. API Integration
We use ConnectSafely.ai for LinkedIn data access—no scraping, no account risk.

---

## Four Implementations

I've built this agent in four different frameworks to help you choose the right one:

### AutoGen (Python)

Microsoft's AutoGen is great for modular, enterprise-ready code:

```python
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
```

**Pros**: Clean architecture, easy to extend
**Cons**: More boilerplate code

### CrewAI (Python)

CrewAI uses a task-oriented approach:

```python
agent = Agent(
    role="LinkedIn Export Specialist",
    goal="Search profiles and export to Sheets",
    tools=[search_people, export_to_sheets],
    memory=True,
)
```

**Pros**: Intuitive task model, built-in memory
**Cons**: Less control over execution flow

### LangGraph (TypeScript)

LangGraph brings state machine concepts to agents:

```typescript
const workflow = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");
```

**Pros**: Fine-grained control, great for complex flows
**Cons**: Steeper learning curve

### Mastra (TypeScript)

Mastra is the simplest to configure:

```typescript
export const linkedInExportAgent = new Agent({
  name: "LinkedIn Export Agent",
  model: "google/gemini-3-flash-preview",
  tools: { searchPeopleTool, exportToSheetsTool },
  memory: new Memory({ storage: new LibSQLStore() }),
});
```

**Pros**: Minimal configuration, built-in UI
**Cons**: Less flexibility for custom behaviors

---

## Building the Tools

Each tool wraps an API call. Here's the search tool:

```python
def search_people(
    keywords: str,
    location: str = None,
    title: str = None,
    limit: int = 100
) -> Dict[str, Any]:
    """Search for LinkedIn profiles."""

    response = requests.post(
        "https://api.connectsafely.ai/linkedin/search/people",
        headers={
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json",
        },
        json={
            "keywords": keywords,
            "location": location,
            "title": title,
            "limit": limit,
        },
    )

    data = response.json()
    return {
        "success": True,
        "people": format_results(data["people"]),
        "count": len(data["people"]),
    }
```

And the export tool:

```python
def export_to_sheets(
    people: List[Dict],
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> Dict[str, Any]:
    """Export results to Google Sheets using OAuth authentication."""
    from .client import GoogleSheetsClient
    
    client = GoogleSheetsClient()
    # Uses OAuth authentication via get_access_token()
    # Handles spreadsheet creation and duplicate detection
    # Automatically creates spreadsheet if ID not provided

    return {
        "success": True,
        "rows_exported": len(rows),
        "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}",
    }
```

---

## Setting Up Google Sheets

To enable Sheets export:

1. **Create a Google Cloud project**
   - Go to console.cloud.google.com
   - Create a new project

2. **Enable the Sheets API**
   - Search for "Google Sheets API"
   - Click Enable

3. **Create OAuth credentials**
   - Go to APIs & Services → Credentials
   - Create OAuth client ID (Desktop app type)
   - Generate refresh token using OAuth Playground
   - Required scopes: `https://www.googleapis.com/auth/spreadsheets`, `https://www.googleapis.com/auth/drive`

4. **Configure environment**
   ```bash
   GOOGLE_CLIENT_ID=your_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_oauth_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

---

## The Magic of ConnectSafely.ai

Traditional LinkedIn automation involves scraping, which:
- Risks account suspension
- Requires managing cookies/sessions
- Breaks when LinkedIn changes their UI

ConnectSafely.ai solves all of this:
- **API-based**: No scraping
- **Compliant**: Follows LinkedIn's terms
- **Simple auth**: Just a bearer token
- **Rich data**: Full profile information

Get an API key at [connectsafely.ai](https://connectsafely.ai).

---

## Real-World Workflow

Here's how I use this agent:

**Monday morning:**
```
Me: "Search for 50 VPs of Engineering at Series B+ companies in San Francisco"
Agent: "Found 47 profiles matching your criteria."
Me: "Export to Google Sheets"
Agent: "Exported 47 profiles. URL: [link]"
```

**Total time: 2 minutes**

**Without the agent:** This would take 2-3 hours of manual work.

---

## Extending the Agent

Once you have the basic agent working, you can add:

### Email Enrichment
Add a tool that looks up email addresses for each profile.

### Company Research
Add a tool that fetches company information (size, funding, industry).

### Automated Outreach
Connect to your email or LinkedIn messaging to send personalized messages.

### Scheduled Searches
Run the same search weekly and only export new profiles.

---

## Getting Started

The full code is on GitHub:

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd agentic-framework-examples/linkedin-to-sheets-export

# Choose your framework
cd agentic/autogen  # or crewai, langGraph, mastra

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Install and run
# Python: uv sync && uv run streamlit run App.py
# TypeScript: bun install && bun run dev
```

---

## Framework Recommendation

**Choose AutoGen if:**
- You want modular, enterprise-ready Python code
- You plan to extend the agent significantly

**Choose CrewAI if:**
- You think in terms of tasks and workflows
- You want built-in memory and task management

**Choose LangGraph if:**
- You need complex, multi-step workflows
- You want fine-grained control over execution

**Choose Mastra if:**
- You want the fastest setup time
- You prefer TypeScript with minimal configuration

---

## Next Week

I'll be diving into how to add email enrichment to this agent and build an automated outreach sequence. Subscribe to make sure you don't miss it!

---

*Have questions about AI agents or this implementation? Reply to this email—I read every response.*

*Found this valuable? Share it with someone who spends too much time on LinkedIn research.*
