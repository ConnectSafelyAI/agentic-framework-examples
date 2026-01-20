# CrewAI: The Task-Oriented Way to Build AI Agents

## This week: Building a LinkedIn export agent with roles, goals, and tasks

---

Welcome back!

This week we're exploring CrewAI—a framework that thinks about AI agents differently than most.

Instead of prompts and chains, CrewAI uses **roles**, **goals**, and **tasks**. It's a mental model that maps to how we actually work.

Let's build something with it.

---

## What We're Building

A LinkedIn data export agent that:
- Searches profiles by keywords, location, and title
- Exports results to Google Sheets
- Remembers context between commands
- Runs in a web interface

---

## The CrewAI Philosophy

Most frameworks make you think like a programmer:
- "What prompt do I write?"
- "How do I chain these calls?"
- "Where does state go?"

CrewAI makes you think like a manager:
- "Who's doing this work?"
- "What's their goal?"
- "What does 'done' look like?"

This shift is subtle but powerful.

---

## Step 1: Define the Agent

In CrewAI, agents have personality:

```python
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro")

export_agent = Agent(
    role="LinkedIn Export Specialist",

    goal="Search LinkedIn profiles and export results to spreadsheets efficiently",

    backstory="""You are an expert at finding professional profiles on LinkedIn.
    You understand how to interpret search requests, use the right parameters,
    and organize data for clean exports. You're methodical and thorough.""",

    tools=[search_people, export_to_sheets, export_to_json],

    llm=llm,
    memory=True,
    verbose=True,
)
```

Three things to notice:

1. **Role** is a job title, not a description
2. **Goal** is outcome-focused
3. **Backstory** shapes personality and approach

---

## Step 2: Create the Tools

CrewAI tools use the `@tool` decorator:

```python
from crewai.tools import tool
import requests
import os

@tool("Search LinkedIn People")
def search_people(
    keywords: str,
    location: str = None,
    title: str = None,
    limit: int = 100
) -> dict:
    """
    Search for LinkedIn profiles using ConnectSafely.ai.

    Args:
        keywords: Search terms like "CEO startup" or "software engineer"
        location: Geographic filter like "New York" or "United States"
        title: Job title filter like "VP of Sales"
        limit: Maximum results to return (default: 100)

    Returns:
        Dictionary with list of people and count
    """
    response = requests.post(
        "https://api.connectsafely.ai/linkedin/search/people",
        headers={
            "Authorization": f"Bearer {os.getenv('CONNECTSAFELY_API_TOKEN')}",
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

    return {
        "success": True,
        "people": [format_profile(p) for p in people],
        "count": len(people),
    }

def format_profile(p):
    return {
        "profileUrl": p.get("profileUrl", ""),
        "fullName": f"{p.get('firstName', '')} {p.get('lastName', '')}".strip(),
        "headline": p.get("headline", ""),
        "location": p.get("location", ""),
    }
```

**Key insight**: The docstring is crucial. CrewAI uses it to decide when to use this tool.

---

## Step 3: Export Tools

```python
# tools/googlesheet/export_to_sheets.py
@tool("Export to Google Sheets")
def export_to_sheets(
    people: list,
    spreadsheet_id: str = None,
    spreadsheet_title: str = None,
    sheet_name: str = "LinkedIn People"
) -> dict:
    """Export profiles to Google Sheets using OAuth authentication."""
    from .client import GoogleSheetsClient
    
    client = GoogleSheetsClient()
    # Uses OAuth authentication (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
    # Handles spreadsheet creation and duplicate detection
    # Returns detailed export statistics


@tool("Export to JSON")
def export_to_json(people: list, filename: str = None) -> dict:
    """
    Export profiles to a JSON file.

    Args:
        people: List of profile dictionaries
        filename: Output filename (auto-generated if not provided)

    Returns:
        Success status and file path
    """
    import json
    from datetime import datetime

    if not filename:
        timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
        filename = f"linkedin-export-{timestamp}.json"

    export_data = {
        "exportedAt": datetime.now().isoformat(),
        "count": len(people),
        "people": people,
    }

    with open(filename, "w") as f:
        json.dump(export_data, f, indent=2)

    return {
        "success": True,
        "file_path": filename,
        "records_exported": len(people),
    }
```

---

## Step 4: Tasks and Crews

Here's where CrewAI differs most. Each command becomes a **task**:

```python
from crewai import Task, Crew

def execute_command(agent, command: str, context: str = None):
    """Execute a user command as a CrewAI task."""

    task_description = command
    if context:
        task_description = f"Context from previous actions:\n{context}\n\nNew request: {command}"

    task = Task(
        description=task_description,
        expected_output="A clear summary of what was done and the results",
        agent=agent,
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True,
    )

    return crew.kickoff()
```

The `expected_output` field is powerful. It tells the agent what success looks like.

---

## Step 5: The Wrapper Class

```python
class LinkedInExportCrew:
    def __init__(self):
        self.agent = self._create_agent()
        self.context = ""

    def _create_agent(self):
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.1)

        return Agent(
            role="LinkedIn Export Specialist",
            goal="Search and export LinkedIn profiles efficiently",
            backstory="Expert at finding professionals and organizing data",
            tools=[search_people, export_to_sheets, export_to_json],
            llm=llm,
            memory=True,
        )

    def execute(self, command: str) -> dict:
        task = Task(
            description=f"{self.context}\n\nRequest: {command}" if self.context else command,
            expected_output="Summary of action and results",
            agent=self.agent,
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        result = crew.kickoff()

        # Update context for next command
        self.context += f"\nUser: {command}\nResult: {result}\n"

        return {"result": str(result)}
```

---

## Step 6: Streamlit UI

```python
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

from crew import LinkedInExportCrew

st.set_page_config(page_title="CrewAI LinkedIn Export", page_icon="📊")
st.title("📊 LinkedIn Export Agent")

if "crew" not in st.session_state:
    st.session_state.crew = LinkedInExportCrew()
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display history
for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

# Handle input
if command := st.chat_input("What would you like to do?"):
    st.session_state.messages.append({"role": "user", "content": command})
    st.chat_message("user").write(command)

    with st.chat_message("assistant"):
        with st.spinner("Working..."):
            result = st.session_state.crew.execute(command)
            st.markdown(result["result"])
            st.session_state.messages.append({
                "role": "assistant",
                "content": result["result"]
            })
```

---

## Running It

```bash
cd linkedin-to-sheets-export/agentic/crewai
cp .env.example .env
# Edit .env with your keys
uv sync
uv run streamlit run App.py
```

---

## Example Session

```
You: Search for 30 VPs of Engineering in Austin, Texas

Agent: I found 28 profiles matching your criteria:

1. Sarah Chen - VP of Engineering at TechCorp
2. Michael Rodriguez - VP Engineering at StartupXYZ
...

Would you like me to export these results?

You: Yes, export to Google Sheets

Agent: Successfully exported 28 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/1abc123...
```

---

## When to Use CrewAI

**Great for:**
- Rapid prototyping
- Task-oriented workflows
- When you want built-in memory
- Multi-agent systems (future expansion)

**Consider alternatives for:**
- Complex conditional logic
- Custom execution flows
- Fine-grained control needs

---

## Next Week

We'll look at LangGraph—the state machine approach to AI agents. Same problem, completely different architecture.

---

*Questions? Reply to this email. I read every one.*
