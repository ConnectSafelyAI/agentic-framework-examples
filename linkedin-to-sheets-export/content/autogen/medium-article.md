# How I Built a LinkedIn Data Export Agent with Microsoft's AutoGen

## A deep dive into building production-ready AI agents with modular architecture

---

Last month, our sales team was spending 15+ hours per week manually searching LinkedIn and copying profile data into spreadsheets. The process was tedious, error-prone, and frankly, a waste of talented people's time.

So I built an AI agent to do it for them. Here's how.

---

## The Problem

If you've ever tried to build a prospect list from LinkedIn, you know the drill:

1. Search for people matching your criteria
2. Open each profile
3. Copy name, title, company, location
4. Paste into spreadsheet
5. Repeat 100+ times

It's mind-numbing work that anyone would want to automate.

## Why I Chose AutoGen

I evaluated several agent frameworks before settling on Microsoft's AutoGen:

**LangChain**: Too much abstraction, hard to debug
**CrewAI**: Great for multi-agent, overkill for this use case
**Raw API calls**: Not maintainable

**AutoGen** hit the sweet spot:
- Clean, modular architecture
- Easy to understand code flow
- Production-ready patterns
- Great documentation

## The Architecture

```
┌─────────────────────────────────────────┐
│           Streamlit UI                  │
├─────────────────────────────────────────┤
│         LinkedInExportClient            │
├─────────────────────────────────────────┤
│        LinkedInExportAssistant          │
│  ┌─────────┬─────────┬─────────┐       │
│  │ Search  │ Export  │ Export  │       │
│  │ People  │ Sheets  │  JSON   │       │
│  └─────────┴─────────┴─────────┘       │
├─────────────────────────────────────────┤
│          ConnectSafely.ai API           │
└─────────────────────────────────────────┘
```

The key insight: **keep each layer focused on one thing**.

## Building the Tools

In AutoGen, tools are just Python functions. Here's the search tool:

```python
def search_people(
    keywords: str,
    location: str = None,
    title: str = None,
    limit: int = 100
) -> dict:
    """Search LinkedIn profiles via ConnectSafely.ai."""

    response = requests.post(
        "https://api.connectsafely.ai/linkedin/search/people",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={
            "keywords": keywords,
            "location": location,
            "title": title,
            "limit": limit
        }
    )

    data = response.json()
    people = data.get("people", [])

    return {
        "success": True,
        "people": [format_profile(p) for p in people],
        "count": len(people)
    }
```

Simple, focused, testable. That's the AutoGen way.

## The Export Tool

The Google Sheets export uses OAuth authentication and is modularized:

```python
# tools/googlesheet/export_to_sheets.py
from .client import GoogleSheetsClient

def export_to_sheets(
    people: list,
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> dict:
    """Export profiles to Google Sheets using OAuth authentication."""
    client = GoogleSheetsClient()
    # Uses OAuth authentication (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
    # Handles spreadsheet creation and duplicate detection
        p["company"],
        p["location"],
        p["profileUrl"]
    ] for p in people]

    # Append
    worksheet.append_rows(rows)

    return {
        "success": True,
        "rows_exported": len(rows)
    }
```

## Wiring Up the Agent

AutoGen's `AssistantAgent` brings it all together:

```python
class LinkedInExportAssistant:
    def __init__(self):
        self.model = GoogleGenAI(
            model="gemini-2.5-pro",
            api_key=os.getenv("GEMINI_API_KEY")
        )

        self.assistant = AssistantAgent(
            name="linkedin_export",
            model_client=self.model,
            tools=[search_people, export_to_sheets, export_to_json],
            system_message=SYSTEM_PROMPT
        )

    async def run(self, command: str) -> str:
        result = await self.assistant.run(task=command)
        return clean_response(result)
```

The system prompt is critical:

```python
SYSTEM_PROMPT = """You are a LinkedIn Export Assistant.

Available tools:
- search_people: Find LinkedIn profiles
- export_to_sheets: Export to Google Sheets
- export_to_json: Export to JSON file

When searching, always summarize results.
When exporting, provide the destination URL/path.
Remember previous search results for follow-up commands."""
```

## The Memory Challenge

One tricky part: the agent needs to remember search results for follow-up exports.

I solved this with a dedicated `MemoryManager`:

```python
class MemoryManager:
    def __init__(self):
        self.search_results = []
        self.context = ""

    def store_results(self, results: list):
        self.search_results = results

    def build_context(self, command: str) -> str:
        if self.search_results:
            return f"""Previous search found {len(self.search_results)} profiles.
User command: {command}"""
        return command

    def should_reset(self, command: str) -> bool:
        reset_keywords = ["new search", "start over", "clear"]
        return any(kw in command.lower() for kw in reset_keywords)
```

Now the user can say "export those to Sheets" without specifying which results.

## The Streamlit Interface

I used Streamlit for the UI because:
1. Fast to build
2. Built-in chat components
3. Session state management
4. No frontend code needed

```python
import streamlit as st

st.title("📊 LinkedIn to Sheets Export")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

if command := st.chat_input("Enter command..."):
    st.session_state.messages.append({"role": "user", "content": command})

    with st.spinner("Working..."):
        result = client.execute(command)

    st.session_state.messages.append({"role": "assistant", "content": result})
```

## Real Results

After deploying this agent:

**Before**: 15 hours/week on manual data entry
**After**: 30 minutes/week reviewing results

The agent handles:
- 500+ profile searches per week
- Automatic deduplication
- Consistent data formatting
- Direct Sheets integration

## Lessons Learned

### 1. Keep Tools Simple

Each tool should do one thing. If you're tempted to add parameters, consider a new tool instead.

### 2. System Prompts Matter

Spend time crafting clear instructions. The agent is only as good as its guidance.

### 3. Memory is Tricky

Think carefully about what context the agent needs between turns.

### 4. Test the Happy Path First

Get the basic flow working before handling edge cases.

## What's Next

I'm extending this agent to:
- Add email enrichment
- Schedule automated searches
- Send personalized outreach

## Try It Yourself

The full code is on GitHub:

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd linkedin-to-sheets-export/agentic/autogen
cp .env.example .env
uv sync
uv run streamlit run App.py
```

You'll need:
- ConnectSafely.ai API token (free tier available)
- Google Gemini API key
- Google OAuth credentials (for exports)

---

*Building something similar? I'd love to hear about it. Connect with me on LinkedIn or leave a comment below.*
