---
title: Export LinkedIn Data to Google Sheets with CrewAI
published: true
description: Build a task-oriented AI agent that searches LinkedIn profiles and exports them to spreadsheets using CrewAI
tags: python, crewai, ai, automation
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/crewai-linkedin-sheets.png
canonical_url:
---

# Export LinkedIn Data to Google Sheets with CrewAI

CrewAI makes building AI agents intuitive with its task-oriented approach. In this tutorial, we'll build an agent that searches LinkedIn and exports results to Google Sheets.

## What We're Building

A CrewAI agent that:
- Searches LinkedIn profiles via natural language
- Exports results to Google Sheets or JSON
- Remembers context between commands
- Runs in a Streamlit web interface

## Why CrewAI?

CrewAI shines for:
- **Task-Based Design**: Think in terms of jobs to be done
- **Built-in Memory**: Automatic context management
- **Tool Decorators**: Simple `@tool` syntax
- **Rapid Prototyping**: Get agents running fast

## Prerequisites

- Python 3.10+
- ConnectSafely.ai API token
- Google Gemini API key
- Google Sheets credentials (optional)

## Project Structure

```
crewai/
├── App.py              # Streamlit UI
├── crew.py             # CrewAI wrapper
├── workflows.py        # Command handlers
├── pyproject.toml      # Dependencies
├── agents/
│   └── agents.py       # Agent definition
└── tools/
    ├── search_people_tool.py
    └── googlesheet/                 # Google Sheets export module
        ├── auth.py                  # OAuth authentication
        ├── client.py                # Google Sheets API client
        └── export_to_sheets.py      # Export tool
    └── export_to_json_tool.py
```

## Step 1: Setup

```bash
cd linkedin-to-sheets-export/agentic/crewai
cp .env.example .env
# Add your API keys to .env
uv sync
```

## Step 2: Create Tools with @tool Decorator

CrewAI uses decorators to define tools:

```python
# tools/search_people_tool.py
import os
import requests
from crewai.tools import tool

@tool("Search LinkedIn People")
def search_people(
    keywords: str,
    location: str = None,
    title: str = None,
    limit: int = 100
) -> dict:
    """
    Search for LinkedIn profiles using ConnectSafely.ai API.

    Args:
        keywords: Search terms like "CEO SaaS" or "Software Engineer"
        location: Geographic filter like "San Francisco" or "United States"
        title: Job title filter like "Head of Growth"
        limit: Maximum results to return (default: 100)

    Returns:
        Dictionary with people list and count
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
    if isinstance(data, list):
        data = data[0] if data else {}

    people = data.get("people", [])

    formatted = [{
        "profileUrl": p.get("profileUrl", ""),
        "fullName": f"{p.get('firstName', '')} {p.get('lastName', '')}".strip(),
        "headline": p.get("headline", ""),
        "location": p.get("location", ""),
    } for p in people]

    return {
        "success": True,
        "people": formatted,
        "count": len(formatted)
    }
```

## Step 3: Export Tools

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
# tools/googlesheet/client.py
import requests
from .auth import get_access_token

class GoogleSheetsClient:
    """Wrapper for Google Sheets API operations."""
    
    def create_spreadsheet(self, title: str, sheet_name: str, headers: list):
        # Creates spreadsheet with OAuth authentication
        pass
    
    def append_data(self, spreadsheet_id: str, sheet_name: str, values: list):
        # Appends rows using OAuth
        pass
```

```python
# tools/googlesheet/export_to_sheets.py
from crewai.tools import tool
from .client import GoogleSheetsClient

@tool("Export to Google Sheets")
def export_to_sheets(
    people: list,
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> dict:
    """Export LinkedIn profiles to Google Sheets using OAuth authentication."""
    client = GoogleSheetsClient()
    # Uses OAuth authentication
    # Handles spreadsheet creation and duplicate detection
```

## Step 4: Define the Agent

```python
# agents/agents.py
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

from tools.search_people_tool import search_people
from tools.googlesheet.export_to_sheets import export_to_sheets
from tools.export_to_json_tool import export_to_json

def create_export_agent():
    """Create the LinkedIn Export Agent."""

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        temperature=0.1,
    )

    return Agent(
        role="LinkedIn Export Specialist",
        goal="Search LinkedIn profiles and export results to Google Sheets or JSON files",
        backstory="""You are an expert at finding professional profiles on LinkedIn
        and organizing the data for export. You understand search parameters,
        can interpret user requests, and efficiently export data to spreadsheets.""",
        tools=[search_people, export_to_sheets, export_to_json],
        llm=llm,
        memory=True,
        verbose=True,
    )
```

## Step 5: Create the Crew Wrapper

```python
# crew.py
from crewai import Crew, Task
from agents.agents import create_export_agent

class LinkedInExportCrew:
    def __init__(self):
        self.agent = create_export_agent()
        self.search_results = []

    def execute(self, command: str, context: str = None) -> dict:
        """Execute a command with the crew."""

        # Build task description
        task_desc = command
        if context:
            task_desc = f"{context}\n\nCurrent request: {command}"

        task = Task(
            description=task_desc,
            expected_output="A summary of the action taken and results",
            agent=self.agent,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=True,
        )

        result = crew.kickoff()

        return {
            "success": True,
            "result": str(result)
        }
```

## Step 6: Build the UI

```python
# App.py
import os
import streamlit as st
from dotenv import load_dotenv
from crew import LinkedInExportCrew

load_dotenv()

st.set_page_config(page_title="LinkedIn Export - CrewAI", page_icon="📊")
st.title("📊 LinkedIn to Sheets Export")
st.caption("Powered by CrewAI & ConnectSafely.ai")

# Initialize
if "crew" not in st.session_state:
    st.session_state.crew = LinkedInExportCrew()

if "messages" not in st.session_state:
    st.session_state.messages = []

if "context" not in st.session_state:
    st.session_state.context = ""

# Examples
with st.expander("Example Commands"):
    st.markdown("""
    - `Search for 50 CEOs in New York`
    - `Find software engineers in San Francisco`
    - `Export results to Google Sheets`
    - `Save as JSON`
    """)

# Chat history
for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

# Input
if command := st.chat_input("Enter command..."):
    st.session_state.messages.append({"role": "user", "content": command})
    st.chat_message("user").write(command)

    with st.chat_message("assistant"):
        with st.spinner("CrewAI working..."):
            result = st.session_state.crew.execute(
                command=command,
                context=st.session_state.context
            )

            response = result.get("result", "")
            st.markdown(response)

            st.session_state.messages.append({
                "role": "assistant",
                "content": response
            })

            # Update context
            st.session_state.context += f"\nUser: {command}\nAgent: {response}\n"
```

## Step 7: Run

```bash
uv run streamlit run App.py
```

## Key CrewAI Patterns

### 1. Tool Decorators

The `@tool` decorator is the cleanest way to define tools:

```python
@tool("Tool Name")
def my_tool(param: str) -> dict:
    """Docstring becomes the tool description."""
    return {"result": "value"}
```

### 2. Agent Memory

Enable memory for context retention:

```python
Agent(
    # ...
    memory=True,  # Enables conversation memory
)
```

### 3. Task-Based Execution

Each command becomes a task:

```python
task = Task(
    description="What to do",
    expected_output="What success looks like",
    agent=agent,
)
```

## Extending the Agent

### Add Multiple Agents

```python
researcher = Agent(role="Researcher", ...)
exporter = Agent(role="Data Exporter", ...)

crew = Crew(
    agents=[researcher, exporter],
    tasks=[research_task, export_task],
    process=Process.sequential,
)
```

### Add Custom Memory

```python
from crewai.memory import LongTermMemory

agent = Agent(
    # ...
    memory=True,
    long_term_memory=LongTermMemory(),
)
```

## Troubleshooting

**"Tool not found"**
- Ensure tools are passed to the Agent constructor
- Check tool function names match what agent expects

**Slow execution**
- CrewAI has overhead; consider caching results
- Use `verbose=False` in production

**Memory issues**
- Context can grow large; implement truncation
- Clear context periodically

## Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [ConnectSafely.ai API](https://connectsafely.ai/docs)
- [Full Source Code](https://github.com/ConnectSafelyAI/agentic-framework-examples/tree/main/linkedin-to-sheets-export/agentic/crewai)

---

*Questions? Drop them in the comments!*
