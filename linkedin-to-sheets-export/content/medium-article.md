# How I Built an AI Agent That Exports LinkedIn Searches to Google Sheets (In 4 Different Frameworks)

## From Manual Copy-Paste to "Find 100 CEOs and Export to Sheets"

Last month, I spent an entire afternoon searching LinkedIn for potential leads and manually copying their information into a spreadsheet. By the end, I had about 50 profiles and a headache.

That's when I decided to build something better.

---

## The Vision

I wanted an AI agent that could understand commands like:

> "Search for 50 software engineers in San Francisco with title 'Senior' and export to Google Sheets"

And then just... do it. Automatically. With properly formatted data.

## The Result

I built this agent using **four different agentic frameworks** to compare approaches and help others choose the right tool for their needs:

- **AutoGen** (Python/Streamlit)
- **CrewAI** (Python/Streamlit)
- **LangGraph** (TypeScript/CLI)
- **Mastra** (TypeScript/Web UI)

Let me walk you through how each one works.

---

## Understanding the Architecture

All four implementations share the same core workflow:

```
User Command → AI Agent → ConnectSafely.ai API → Format Data → Export
```

The key components:

1. **Natural Language Understanding**: The AI interprets your command
2. **Tool Selection**: The agent chooses the right tools to use
3. **API Integration**: ConnectSafely.ai provides LinkedIn data (no scraping!)
4. **Data Export**: Results go to Google Sheets or JSON

---

## Implementation 1: AutoGen

Microsoft's AutoGen framework excels at modular, maintainable code. I organized everything into files under 100 lines each:

```
autogen/
├── agents/
│   ├── assistant.py           # Main orchestration
│   └── config/
│       ├── agent_factory.py   # Agent creation
│       ├── memory_manager.py  # Context management
│       └── response_processor.py
├── tools/
│   ├── search_people_tool.py
│   └── export_to_sheets_tool.py
```

The Streamlit interface makes it accessible to non-technical users:

```python
st.title("📊 LinkedIn Search → Google Sheets Export")

command = st.chat_input("Enter your command...")
if command:
    with st.spinner("Agent working..."):
        result = client.execute(command=command)
    st.markdown(result)
```

**Best for**: Teams that want clean, extensible Python code.

---

## Implementation 2: CrewAI

CrewAI's strength is its task-oriented approach. You define an agent with a role, goal, and backstory:

```python
agent = Agent(
    role="LinkedIn Export Specialist",
    goal="Search LinkedIn profiles and export results to Google Sheets or JSON",
    backstory="""You are an expert at searching LinkedIn for specific
    types of professionals and exporting the data efficiently...""",
    tools=[search_people, export_to_sheets, export_to_json],
    memory=True,
)
```

The `@tool` decorator makes creating tools intuitive:

```python
@tool("Search LinkedIn People")
def search_people(keywords: str, location: str = None) -> Dict[str, Any]:
    """Search for LinkedIn profiles by keywords and location."""
    # Implementation here
```

**Best for**: Developers who think in terms of tasks and workflows.

---

## Implementation 3: LangGraph

LangGraph brings state machine concepts to AI agents. This is powerful for complex, multi-step workflows:

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

The CLI interface is clean and focused:

```
╔══════════════════════════════════════════════════════════════╗
║     📊 LinkedIn to Google Sheets Export Agent (LangGraph)    ║
╚══════════════════════════════════════════════════════════════╝

📝 You: Search for 50 CEOs in United States
⏳ Processing...
🤖 Assistant: Found 50 profiles matching your criteria...
```

**Best for**: TypeScript developers who need fine-grained control over execution flow.

---

## Implementation 4: Mastra

Mastra is the newest framework, and it shows—everything is streamlined:

```typescript
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

That's it. The entire agent configuration. Mastra handles the UI, memory, and orchestration.

**Best for**: Rapid prototyping and teams that want minimal configuration.

---

## The Secret Sauce: ConnectSafely.ai

All implementations rely on [ConnectSafely.ai](https://connectsafely.ai) for LinkedIn data. This is crucial because:

1. **No scraping** = No risk of account bans
2. **Bearer token auth** = Simple integration
3. **Rich data** = Complete profile information
4. **Rate limiting** = Built-in protection

The API is straightforward:

```javascript
const response = await fetch(
  "https://api.connectsafely.ai/linkedin/search/people",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
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

---

## Real-World Results

After building these agents, my LinkedIn research workflow went from:

**Before**: 4 hours → 50 profiles → manual formatting → inevitable errors

**After**: 5 minutes → 100 profiles → perfectly formatted → exported to Sheets

That's a **48x improvement** in efficiency.

---

## Which Framework Should You Choose?

Here's my recommendation based on use case:

| Scenario | Recommendation |
|----------|----------------|
| Enterprise Python codebase | AutoGen |
| Task automation workflows | CrewAI |
| Complex multi-step processes | LangGraph |
| Quick prototype or MVP | Mastra |

---

## Get the Code

The complete source code for all four implementations is available:

```bash
git clone https://github.com/ConnectSafelyAI/agentic-framework-examples
cd agentic-framework-examples/linkedin-to-sheets-export
```

Each framework has detailed setup instructions in its README.

---

## What I Learned

Building the same agent in four different frameworks taught me:

1. **Framework choice matters less than you think**. They all get the job done.
2. **The API integration is the hard part**. The framework is just glue.
3. **Memory management differs significantly** between frameworks.
4. **TypeScript frameworks are catching up** to Python in the AI agent space.

---

## What's Next?

This agent is a foundation. You could extend it to:

- Schedule automated daily searches
- Add email enrichment via another API
- Build outreach sequences
- Create alerts for new profiles matching criteria

The possibilities are endless when you have an AI agent that understands natural language and can take action.

---

*If you found this useful, follow me for more AI agent tutorials. I publish weekly deep-dives into building practical AI applications.*

*Have questions? Leave a comment below!*
