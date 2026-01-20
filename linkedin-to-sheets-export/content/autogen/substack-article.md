# Building LinkedIn Export Agents with AutoGen

## This week: A complete walkthrough of Microsoft's agent framework

---

Happy Friday, builders!

This week I'm diving deep into Microsoft's AutoGen framework. We'll build a practical agent that searches LinkedIn and exports results to Google Sheets.

No fluff. Just working code you can deploy today.

---

## Why AutoGen?

I've built agents with most major frameworks. AutoGen stands out for one reason: **it gets out of your way**.

Other frameworks impose their worldview on you. AutoGen gives you clean primitives and lets you architect as you see fit.

For this LinkedIn export agent, that means:
- Simple function-based tools
- Explicit control over conversation flow
- Easy testing and debugging

## The Complete Implementation

Let's build this step by step.

### Step 1: Project Setup

```bash
mkdir linkedin-export-autogen
cd linkedin-export-autogen
uv init
```

Dependencies in `pyproject.toml`:

```toml
[project]
dependencies = [
    "autogen-agentchat>=0.7.0",
    "autogen-ext[google]>=0.4.0",
    "streamlit>=1.39.0",
    "requests>=2.32.0",
    "requests>=2.32.0",
    "python-dotenv>=1.0.0",
]
```

### Step 2: Environment Variables

Create `.env`:

```bash
CONNECTSAFELY_API_TOKEN=your_token_here
GEMINI_API_KEY=your_key_here
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
```

### Step 3: The Search Tool

```python
# tools/search_people_tool.py
import os
import requests
from typing import Dict, Any, Optional

def search_people(
    keywords: str,
    location: Optional[str] = None,
    title: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Search for LinkedIn profiles.

    Args:
        keywords: Search terms (e.g., "CEO SaaS")
        location: Geographic filter (e.g., "San Francisco")
        title: Job title filter (e.g., "Head of Growth")
        limit: Max results (default 100)

    Returns:
        Dict with people list and count
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")

    response = requests.post(
        "https://api.connectsafely.ai/linkedin/search/people",
        headers={
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
        },
        json={
            "keywords": keywords,
            "location": location,
            "title": title,
            "limit": min(limit, 100),
        },
        timeout=60,
    )

    data = response.json()

    # API returns array wrapper
    if isinstance(data, list):
        data = data[0] if data else {}

    people = data.get("people", [])

    # Format for export
    formatted = []
    for p in people:
        formatted.append({
            "profileUrl": p.get("profileUrl", ""),
            "fullName": f"{p.get('firstName', '')} {p.get('lastName', '')}".strip(),
            "headline": p.get("headline", ""),
            "location": p.get("location", ""),
            "connectionDegree": p.get("connectionDegree", ""),
            "isPremium": p.get("isPremium", False),
        })

    return {
        "success": True,
        "people": formatted,
        "count": len(formatted),
    }
```

### Step 4: The Export Tool

The export tool is modularized into separate files:

```python
# tools/googlesheet/auth.py
import os
import requests

def get_access_token() -> str:
    """Get Google OAuth access token from refresh token."""
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "refresh_token": os.getenv("GOOGLE_REFRESH_TOKEN"),
            "grant_type": "refresh_token",
        },
    )
    return response.json()["access_token"]
```

```python
# tools/googlesheet/export_to_sheets.py
from .client import GoogleSheetsClient

def export_to_sheets(
    people: List[Dict[str, Any]],
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> Dict[str, Any]:
    """Export profiles to Google Sheets using OAuth authentication."""
    from .client import GoogleSheetsClient
    
    client = GoogleSheetsClient()
    # Uses OAuth authentication via get_access_token()
    # Handles spreadsheet creation and duplicate detection
    # Returns detailed export statistics
        p.get("fullName", ""),
        p.get("headline", ""),
        p.get("location", ""),
        timestamp
    ] for p in people]

    worksheet.append_rows(rows)

    return {
        "success": True,
        "rows_exported": len(rows),
        "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{sheet_id}"
    }
```

### Step 5: The Agent

```python
# agents/assistant.py
import os
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.google import GoogleGenAI

from tools.search_people_tool import search_people
from tools.googlesheet.export_to_sheets import export_to_sheets
from tools.export_to_json_tool import export_to_json

SYSTEM_PROMPT = """You are a LinkedIn Export Assistant.

Your job is to help users:
1. Search for LinkedIn profiles by keywords, location, and title
2. Export search results to Google Sheets or JSON files

Tools available:
- search_people: Search LinkedIn profiles
- export_to_sheets: Export to Google Sheets
- export_to_json: Export to local JSON file

Guidelines:
- When searching, summarize results with count and examples
- When exporting, confirm the destination (URL or file path)
- Remember previous results for follow-up commands like "export those"
- Ask for clarification if the request is ambiguous"""

class LinkedInExportAssistant:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")

        self.model = GoogleGenAI(
            model="gemini-2.5-pro",
            api_key=self.api_key
        )

        self.tools = [
            search_people,
            export_to_sheets,
            export_to_json
        ]

        self.assistant = AssistantAgent(
            name="linkedin_export_assistant",
            model_client=self.model,
            tools=self.tools,
            system_message=SYSTEM_PROMPT
        )

        self.search_results = []

    async def execute(self, command: str) -> str:
        # Include context about previous results
        context = ""
        if self.search_results:
            context = f"\n\nPrevious search found {len(self.search_results)} profiles."

        full_prompt = command + context

        result = await self.assistant.run(task=full_prompt)

        # Extract and store results
        response_text = self._extract_response(result)
        self._update_memory(response_text)

        return response_text

    def _extract_response(self, result):
        if hasattr(result, 'messages'):
            for msg in reversed(result.messages):
                if hasattr(msg, 'content') and msg.content:
                    return msg.content
        return str(result)

    def _update_memory(self, response: str):
        # Parse results from response if present
        if "profiles" in response.lower() and "found" in response.lower():
            # Extract count and store
            pass
```

### Step 6: The UI

```python
# App.py
import os
import streamlit as st
from dotenv import load_dotenv
import asyncio

load_dotenv()

from agents.assistant import LinkedInExportAssistant

st.set_page_config(
    page_title="LinkedIn Export - AutoGen",
    page_icon="📊",
    layout="wide"
)

st.title("📊 LinkedIn to Sheets Export")
st.caption("Powered by AutoGen & ConnectSafely.ai")

# Initialize
if "assistant" not in st.session_state:
    st.session_state.assistant = LinkedInExportAssistant()

if "messages" not in st.session_state:
    st.session_state.messages = []

# Example commands
with st.expander("Example Commands"):
    st.markdown("""
    - `Search for 50 marketing directors in New York`
    - `Find CEOs at SaaS companies in San Francisco`
    - `Export results to Google Sheets`
    - `Save as JSON file`
    """)

# Chat history
for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

# Input
if command := st.chat_input("Enter your command..."):
    st.session_state.messages.append({"role": "user", "content": command})
    st.chat_message("user").write(command)

    with st.chat_message("assistant"):
        with st.spinner("Working..."):
            result = asyncio.run(
                st.session_state.assistant.execute(command)
            )
            st.markdown(result)
            st.session_state.messages.append({
                "role": "assistant",
                "content": result
            })

# Sidebar
with st.sidebar:
    st.header("Settings")

    if st.button("Clear History"):
        st.session_state.messages = []
        st.session_state.assistant = LinkedInExportAssistant()
        st.rerun()

    st.divider()
    st.caption("Need API keys?")
    st.markdown("[ConnectSafely.ai](https://connectsafely.ai)")
    st.markdown("[Google AI Studio](https://aistudio.google.com)")
```

### Step 7: Run It

```bash
uv sync
uv run streamlit run App.py
```

---

## The Key Insight

What makes this work is the **separation of concerns**:

1. **Tools** handle API calls and data formatting
2. **Agent** handles natural language understanding
3. **UI** handles user interaction
4. **Memory** handles context between turns

Each layer is independently testable and replaceable.

---

## Common Gotchas

**Tool return types**: AutoGen expects tools to return JSON-serializable dicts. Don't return custom objects.

**Async handling**: AutoGen uses async. Use `asyncio.run()` in sync contexts.

**Token limits**: Gemini has context limits. Don't dump entire datasets into prompts.

---

## What's Next?

Next week I'll show how to add:
- Email enrichment with Hunter.io
- Automated weekly searches
- Slack notifications for new leads

Subscribe so you don't miss it.

---

*Reply to this email with questions. I read every one.*
