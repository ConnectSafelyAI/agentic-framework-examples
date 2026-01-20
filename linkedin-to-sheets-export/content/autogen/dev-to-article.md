---
title: Build a LinkedIn to Google Sheets Export Agent with AutoGen
published: true
description: Learn how to build an AI agent that searches LinkedIn and exports results to Google Sheets using Microsoft's AutoGen framework
tags: python, autogen, ai, automation
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/autogen-linkedin-sheets.png
canonical_url:
---

# Build a LinkedIn to Google Sheets Export Agent with AutoGen

Microsoft's AutoGen is a powerful framework for building multi-agent AI systems. In this tutorial, we'll build an agent that searches LinkedIn profiles and exports results directly to Google Sheets.

## What We're Building

An AI agent that:
- Understands natural language commands
- Searches LinkedIn via ConnectSafely.ai API
- Exports results to Google Sheets or JSON
- Maintains conversation context

## Why AutoGen?

AutoGen excels at:
- **Modular Architecture**: Clean separation of concerns
- **Extensibility**: Easy to add new tools and capabilities
- **Enterprise-Ready**: Production-grade code patterns
- **Conversation Management**: Built-in multi-turn support

## Prerequisites

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager
- ConnectSafely.ai API token
- Google Gemini API key
- Google Sheets credentials (for Sheets export)

## Project Structure

```
autogen/
├── App.py                    # Streamlit UI
├── autogen_client.py         # Client wrapper
├── workflows.py              # Command handlers
├── pyproject.toml            # Dependencies
├── agents/
│   ├── assistant.py          # Main agent
│   └── config/
│       ├── agent_factory.py  # Agent creation
│       ├── memory_manager.py # Context management
│       └── response_processor.py
└── tools/
    ├── search_people_tool.py
    └── googlesheet/                 # Google Sheets export module
        ├── auth.py                  # OAuth authentication
        ├── client.py                # Google Sheets API client
        └── export_to_sheets.py      # Export function
    └── export_to_json_tool.py
```

## Step 1: Install Dependencies

```bash
cd linkedin-to-sheets-export/agentic/autogen
cp .env.example .env
# Edit .env with your API keys
uv sync
```

## Step 2: Create the Search Tool

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
    """Search for LinkedIn profiles."""

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

    # Handle array wrapper
    if isinstance(data, list):
        data = data[0] if data else {}

    people = data.get("people", [])

    return {
        "success": True,
        "people": format_people(people),
        "count": len(people),
    }

def format_people(people):
    """Format profile data for export."""
    return [{
        "profileUrl": p.get("profileUrl", ""),
        "fullName": f"{p.get('firstName', '')} {p.get('lastName', '')}".strip(),
        "headline": p.get("headline", ""),
        "location": p.get("location", ""),
        "company": extract_company(p.get("headline", "")),
    } for p in people]
```

## Step 3: Create the Export Tool

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
    people: list,
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> dict:
    """Export results to Google Sheets using OAuth authentication."""
    client = GoogleSheetsClient()
    # Uses OAuth authentication
    # Handles spreadsheet creation and duplicate detection
```

## Step 4: Build the Agent

```python
# agents/assistant.py
import os
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.google import GoogleGenAI

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
            name="linkedin_export_agent",
            model_client=self.model,
            tools=self.tools,
            system_message=self._get_system_prompt()
        )

    def _get_system_prompt(self):
        return """You are a LinkedIn Export Assistant that helps users:
1. Search for LinkedIn profiles by keywords, location, and job title
2. Export results to Google Sheets or JSON files

When users ask to search, use the search_people tool.
When users ask to export, use export_to_sheets or export_to_json.
Always summarize results clearly."""

    async def execute_async(self, command: str) -> str:
        result = await self.assistant.run(task=command)
        return str(result)
```

## Step 5: Create the Streamlit UI

```python
# App.py
import streamlit as st
from dotenv import load_dotenv
from autogen_client import LinkedInExportClient

load_dotenv()

st.set_page_config(page_title="LinkedIn Export (AutoGen)", page_icon="📊")
st.title("📊 LinkedIn to Sheets Export")

# Initialize client
if "client" not in st.session_state:
    st.session_state.client = LinkedInExportClient()

if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

# Handle input
if command := st.chat_input("Enter command..."):
    st.session_state.messages.append({"role": "user", "content": command})
    st.chat_message("user").write(command)

    with st.chat_message("assistant"):
        with st.spinner("Working..."):
            result = st.session_state.client.execute(command)
            st.markdown(result["result"])
            st.session_state.messages.append({
                "role": "assistant",
                "content": result["result"]
            })
```

## Step 6: Run the Application

```bash
uv run streamlit run App.py
```

## Example Usage

```
You: Search for 50 CEOs in San Francisco

Agent: Found 47 profiles matching your criteria:
- John Smith - CEO at TechStartup Inc
- Jane Doe - CEO & Founder at AI Solutions
- ...

You: Export to Google Sheets

Agent: Successfully exported 47 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/...
```

## Key AutoGen Patterns

### 1. Modular Tool Design

Keep each tool focused on one task:

```python
# Good: Single responsibility
def search_people(keywords, location, title, limit):
    # Only handles searching

def export_to_sheets(people, spreadsheet_id):
    # Only handles exporting
```

### 2. Memory Management

Use a dedicated memory manager:

```python
class MemoryManager:
    def __init__(self):
        self.search_results = []

    def store_results(self, results):
        self.search_results = results

    def get_results(self):
        return self.search_results
```

### 3. Response Processing

Clean up agent responses:

```python
def clean_response(result):
    """Extract clean text from agent result."""
    if hasattr(result, 'messages'):
        for msg in reversed(result.messages):
            if hasattr(msg, 'content') and msg.content:
                return msg.content
    return str(result)
```

## Extending the Agent

### Add Email Enrichment

```python
def enrich_with_email(profile_url: str) -> dict:
    """Look up email for a LinkedIn profile."""
    # Add your email enrichment logic
    pass

# Add to tools list
self.tools.append(enrich_with_email)
```

### Add Batch Processing

```python
def batch_search(searches: list) -> list:
    """Run multiple searches."""
    results = []
    for search in searches:
        result = search_people(**search)
        results.extend(result["people"])
    return results
```

## Troubleshooting

**"CONNECTSAFELY_API_TOKEN not set"**
- Check your `.env` file exists
- Restart the application after changes

**"Google Sheets credentials not found"**
- Verify OAuth credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- Ensure the JSON file exists

**Slow responses**
- The Gemini API can take 10-30 seconds
- Consider using `gemini-2.0-flash` for faster responses

## Resources

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [ConnectSafely.ai API](https://connectsafely.ai/docs)
- [Full Source Code](https://github.com/ConnectSafelyAI/agentic-framework-examples/tree/main/linkedin-to-sheets-export/agentic/autogen)

---

*Have questions? Drop them in the comments!*
