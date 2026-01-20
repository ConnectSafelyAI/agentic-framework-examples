# Building a LinkedIn Export Agent the CrewAI Way

## How task-oriented thinking changed how I build AI agents

---

I've built AI agents with at least five different frameworks. Each has its philosophy. CrewAI's philosophy clicked with me immediately: **think in tasks, not code**.

Here's how I used that philosophy to build a LinkedIn data export agent.

---

## The CrewAI Mental Model

Most agent frameworks think in terms of:
- Prompts
- Tools
- Conversations

CrewAI thinks differently:
- **Agents** have roles and goals
- **Tasks** have descriptions and expected outputs
- **Crews** orchestrate agents to complete tasks

This maps perfectly to how we think about work in real life. I don't tell my team "here's a prompt." I tell them "here's what I need done."

## The Agent

In CrewAI, an agent has personality:

```python
from crewai import Agent

export_agent = Agent(
    role="LinkedIn Export Specialist",

    goal="Search LinkedIn profiles and export results to spreadsheets",

    backstory="""You're an expert at finding professional profiles
    and organizing data. You understand search parameters and
    can efficiently export data to various formats.""",

    tools=[search_people, export_to_sheets, export_to_json],

    memory=True,
    verbose=True,
)
```

Notice what's different:
- **Role**: Not a system prompt, but a job title
- **Goal**: What success looks like
- **Backstory**: Context that shapes behavior

This isn't just syntactic sugar. It changes how you think about the agent.

## The Tools

CrewAI tools use a clean decorator syntax:

```python
from crewai.tools import tool

@tool("Search LinkedIn People")
def search_people(keywords: str, location: str = None, limit: int = 100) -> dict:
    """
    Search for LinkedIn profiles.

    Args:
        keywords: Search terms like "CEO SaaS"
        location: Geographic filter like "San Francisco"
        limit: Maximum results (default: 100)

    Returns:
        Dictionary with people list and count
    """
    response = requests.post(
        "https://api.connectsafely.ai/linkedin/search/people",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json={"keywords": keywords, "location": location, "limit": limit}
    )

    data = response.json()
    people = data.get("people", [])

    return {
        "success": True,
        "people": format_profiles(people),
        "count": len(people)
    }
```

The docstring matters. CrewAI uses it to help the agent understand when to use this tool.

## The Task

Here's where CrewAI shines. A task is explicit about what you want:

```python
from crewai import Task

search_task = Task(
    description="""Search for 50 marketing directors in New York.
    Include their name, title, company, and LinkedIn URL.""",

    expected_output="""A list of 50 profiles with:
    - Full name
    - Job title
    - Company
    - LinkedIn URL""",

    agent=export_agent,
)
```

The `expected_output` is powerful. It tells the agent what "done" looks like.

## The Crew

A crew brings it together:

```python
from crewai import Crew

crew = Crew(
    agents=[export_agent],
    tasks=[search_task],
    verbose=True,
)

result = crew.kickoff()
```

For our single-agent use case, this might seem like overkill. But it sets us up for extension.

## Building the Full System

### The Wrapper

I wrapped the crew in a class for the Streamlit app:

```python
class LinkedInExportCrew:
    def __init__(self):
        self.agent = self._create_agent()
        self.context = ""

    def _create_agent(self):
        return Agent(
            role="LinkedIn Export Specialist",
            goal="Search and export LinkedIn profiles",
            backstory="Expert at finding and organizing professional data",
            tools=[search_people, export_to_sheets, export_to_json],
            memory=True,
        )

    def execute(self, command: str) -> dict:
        # Include previous context
        task_desc = command
        if self.context:
            task_desc = f"Previous context:\n{self.context}\n\nNew request: {command}"

        task = Task(
            description=task_desc,
            expected_output="Summary of action and results",
            agent=self.agent,
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        result = crew.kickoff()

        # Update context
        self.context += f"\n{command}: {result}"

        return {"result": str(result)}
```

### The UI

Streamlit makes the interface trivial:

```python
import streamlit as st
from crew import LinkedInExportCrew

st.title("LinkedIn Export Agent")

if "crew" not in st.session_state:
    st.session_state.crew = LinkedInExportCrew()

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

if command := st.chat_input("What would you like to do?"):
    st.session_state.messages.append({"role": "user", "content": command})

    with st.spinner("Working..."):
        result = st.session_state.crew.execute(command)

    st.session_state.messages.append({
        "role": "assistant",
        "content": result["result"]
    })
    st.rerun()
```

## What I Learned

### 1. Tasks Force Clarity

Writing `expected_output` made me think harder about what I actually wanted. Vague requests got vague results.

**Bad**: "Search for people"
**Good**: "Search for 50 CEOs in San Francisco. Return name, title, company, and LinkedIn URL."

### 2. Memory Isn't Magic

CrewAI's memory helps, but I still needed to manage context explicitly for multi-turn conversations.

### 3. Verbose Mode is Your Friend

During development, `verbose=True` shows you exactly what the agent is thinking. Turn it off in production.

### 4. Tools Need Good Descriptions

The agent chooses tools based on descriptions. Vague descriptions lead to wrong tool choices.

## Extending to Multi-Agent

The real power of CrewAI emerges with multiple agents:

```python
researcher = Agent(
    role="LinkedIn Researcher",
    goal="Find relevant profiles",
    tools=[search_people],
)

exporter = Agent(
    role="Data Exporter",
    goal="Export data to spreadsheets",
    tools=[export_to_sheets],
)

research_task = Task(
    description="Find 50 CTOs in Austin",
    agent=researcher,
)

export_task = Task(
    description="Export the found profiles to Google Sheets",
    agent=exporter,
    context=[research_task],  # Uses output from research_task
)

crew = Crew(
    agents=[researcher, exporter],
    tasks=[research_task, export_task],
    process=Process.sequential,
)
```

The `context` parameter lets tasks build on each other.

## When to Use CrewAI

**Use CrewAI when:**
- You think naturally in tasks and roles
- You want rapid prototyping
- You plan to add more agents later
- Built-in memory is sufficient

**Consider alternatives when:**
- You need fine-grained control over execution
- You have complex conditional logic
- You need custom memory systems

## Try It

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd linkedin-to-sheets-export/agentic/crewai
cp .env.example .env
# Add your API keys
uv sync
uv run streamlit run App.py
```

---

*Building with CrewAI? I'd love to hear what you're creating. Connect with me on LinkedIn.*
