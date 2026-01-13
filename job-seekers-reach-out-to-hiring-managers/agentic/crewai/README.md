# Job Search → Hiring Manager Outreach Agent (CrewAI)

An intelligent AI agent built with [CrewAI](https://crewai.com) that executes LinkedIn job search tasks on demand using the [ConnectSafely.ai](https://connectsafely.ai) API.

## 🎯 Key Features

- **Command-Based Interface**: Execute tasks step-by-step with natural language commands
- **Context Awareness**: Agent maintains context between commands
- **On-Demand Execution**: Only performs the specific action you request
- **Chat-Style UI**: Interactive Streamlit interface similar to Mastra/LangGraph
- **Single Unified Agent**: One agent handles all tasks intelligently

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- ConnectSafely.ai API token
- Google Gemini API key

### Installation

1. **Navigate to the CrewAI directory**:
```bash
cd job-seekers-reach-out-to-hiring-managers/agentic/crewai
```

2. **Create `.env` file** (if not exists):
```bash
touch .env
```

3. **Add your API keys** to `.env`:
```env
CONNECTSAFELY_API_TOKEN=your_token_here
GEMINI_API_KEY=your_gemini_key_here
```

4. **Install dependencies**:
```bash
uv sync
```

5. **Run the App**:
```bash
uv run streamlit run App.py
```

The app will open in your browser at `http://localhost:8501`

## 💬 How to Use

The agent works with **natural language commands**. Each command executes independently and builds on previous results stored in context.

### Basic Workflow

**Step 1: Search for Jobs**
```
Command: Find 5 software engineering jobs in Australia
```
The agent will:
- Use `SearchGeoLocationTool` to get Australia's location ID
- Use `SearchJobsTool` to find 5 software engineering jobs
- Return job details (title, company, location, job ID)
- Store results in context

**Step 2: Find Hiring Managers**
```
Command: Find hiring managers for the first 3 jobs
```
The agent will:
- Extract company IDs from the first 3 jobs in context
- Use `SearchHiringManagersTool` for each company
- Return basic manager information (name, headline, profile ID)
- Update context with manager details

**Step 3: Connect with Managers**
```
Command: Send connection requests to all hiring managers found
```
The agent will:
- For each manager: check connection status → send personalized request
- Return results for all managers processed

## 📝 Comprehensive Command Examples

### Job Search Commands

**Basic Search:**
- `Find 10 software engineering jobs in India`
- `Search for 5 frontend developer positions in Canada`
- `Get 3 data scientist jobs in London`
- `Find marketing manager jobs in New York`

**With Specific Criteria:**
- `Find remote software engineering jobs in Australia`
- `Search for senior backend developer positions in Singapore`
- `Get 20 full-stack developer jobs in United States`

### Hiring Manager Commands

**For All Jobs:**
- `Find hiring managers for these jobs`
- `Get hiring managers for all jobs found`
- `Search for recruiters at these companies`

**For Specific Jobs:**
- `Find hiring manager for the first job`
- `Get managers for job ID 4352695658`
- `Find hiring managers for the first 3 jobs in the list`
- `Search for managers at the company of the 2nd job`

**With Count:**
- `Find 5 hiring managers for the first job`
- `Get 3 recruiters for each of the first 2 jobs`

### Connection Commands

**Single Connection:**
- `Connect with John Doe`
- `Send connection request to profile ID john-doe-123`
- `Connect with the hiring manager found for job ID 4352695658`

**Multiple Connections:**
- `Send connection requests to all hiring managers found`
- `Connect with hiring managers of the first 3 jobs one by one`
- `Send connection requests to managers for jobs 1, 2, and 3`

**Status Check:**
- `Check connection status for Jane Smith`
- `Verify if I'm connected with profile ID jane-smith-456`

### Advanced Workflows

**Complete Workflow in Steps:**
```
1. Find 20 software engineering jobs in Australia
2. Find hiring managers for the first 5 jobs
3. Send connection requests to all managers found
```

**Targeted Workflow:**
```
1. Find 10 backend developer jobs in India
2. Find hiring manager for the 3rd job
3. Connect with that manager
```

**Batch Processing:**
```
1. Find 15 frontend developer jobs in Canada
2. Find hiring managers for first 3 jobs
3. Send connection requests one by one to all 3 managers
```

## 🏗️ Architecture

### Single Unified Agent

This implementation uses a **single unified agent** that:
- Executes only what you ask for
- Maintains context between commands
- Intelligently selects which tools to use
- Processes multiple items sequentially when requested

### Project Structure

```
crewai/
├── agents/
│   └── agents.py          # Single unified agent
├── tools/                 # All LinkedIn tools
│   ├── search_geo_location_tool.py
│   ├── search_jobs_tool.py
│   ├── search_hiring_managers_tool.py
│   ├── check_connection_status_tool.py
│   ├── send_connection_request_tool.py
│   └── ...
├── workflows.py          # Command execution handler
├── crew.py               # Crew facade
└── App.py                # Streamlit UI
```

### How It Works

```
User Command
    ↓
CrewAI Task Creation (with context)
    ↓
Unified Agent (Gemini 2.0 Flash)
    ↓
Tool Selection & Execution
    ↓
ConnectSafely.ai API → LinkedIn
    ↓
Result Added to Context (max 1500 chars)
    ↓
Display to User
```

### Context Management

The agent maintains a conversation context that includes:
- Previous job search results
- Found hiring managers
- Profile details
- Connection statuses

**Context Limits:**
- Maximum 1500 characters (automatically trimmed)
- Preserves most recent results
- Can be cleared via "Clear History" button

This allows you to reference previous results in new commands without repeating information.

## 🛠️ Available Tools

The agent has access to these tools:

1. **SearchGeoLocationTool** - Convert location names to IDs
2. **SearchJobsTool** - Find LinkedIn jobs by keywords and location
3. **GetCompanyDetailsTool** - Get detailed company information
4. **SearchHiringManagersTool** - Find hiring managers/recruiters at companies
5. **FetchProfileDetailsTool** - Get detailed profile information
6. **CheckConnectionStatusTool** - Check if already connected
7. **SendConnectionRequestTool** - Send personalized connection requests

## 🎨 Features

### Chat Interface
- Real-time command execution
- Message history with scrollback
- Context preservation between commands
- Clear visual feedback and progress indicators

### Smart Context
- Maintains up to 1500 characters of context
- Automatically trims older content
- Preserves relevant information for follow-up commands
- Context size displayed in sidebar

### User-Friendly
- Example commands in expandable section
- Progress indicators during execution
- Error handling with helpful tips
- Clear success/failure feedback
- One-click history clearing

## 💡 Tips & Best Practices

### Command Tips

1. **Be Specific**: 
   - ✅ `Find 5 jobs` instead of `Find jobs`
   - ✅ `First 3 jobs` instead of `Some jobs`

2. **Process Multiple Items**:
   - ✅ `Find managers for first 3 jobs and send connection requests one by one`
   - ✅ `Connect with all hiring managers found`

3. **Use Job IDs**:
   - ✅ `Find hiring manager for job ID 4352695658`
   - ✅ `Connect with manager of the 3rd job`

4. **Start Small**:
   - Start with 1-2 jobs to test
   - Then scale up to larger batches

### Performance Tips

- **Context Management**: Clear history if context gets too large
- **Batch Processing**: Process 3-5 jobs at a time for best results
- **Connection Requests**: Allow time between requests to avoid rate limits

## 🔄 Workflow Examples

### Example 1: Simple Single Job Workflow
```
1. Find 1 software engineering job in India
2. Find hiring manager for this job
3. Connect with that manager
```

### Example 2: Batch Processing
```
1. Find 20 software engineering jobs in Australia
2. Find hiring managers for the first 3 jobs
3. Send connection requests to all 3 managers one by one
```

### Example 3: Targeted Search
```
1. Find 10 backend developer jobs in Canada
2. Find hiring manager for job ID 4352695658
3. Check connection status for that manager
4. Send connection request if not connected
```

### Example 4: Multiple Companies
```
1. Find 15 frontend developer jobs in United States
2. Find hiring managers for jobs 1, 5, and 10
3. Connect with all managers found
```

## 🆚 Comparison with Mastra/LangGraph

This CrewAI implementation works similarly to Mastra and LangGraph:

| Feature | CrewAI (New) | Mastra | LangGraph |
|---------|-------------|--------|-----------|
| Command-based | ✅ | ✅ | ✅ |
| Context awareness | ✅ | ✅ | ✅ |
| On-demand execution | ✅ | ✅ | ✅ |
| Single agent | ✅ | ✅ | ✅ |
| Chat interface | ✅ | ❌ (CLI) | ❌ (CLI) |
| Web UI | ✅ Streamlit | ❌ | ❌ |

## 🐛 Troubleshooting

### Agent stops after first item
**Problem**: When processing multiple items, agent stops after the first one.

**Solution**: 
- Be explicit: `Find managers for first 3 jobs and send connection requests one by one`
- Use "all" keyword: `Send connection requests to all managers found`
- Process in smaller batches (2-3 items at a time)

### Context too large
**Problem**: Context exceeds 1500 characters, causing slow responses.

**Solution**:
- Click "🗑️ Clear History" in the sidebar
- Start a new workflow session
- Process fewer jobs at once

### Connection request failed
**Problem**: Connection request returns error.

**Common Causes**:
- Invalid profile ID (internal LinkedIn ID, not vanity name)
- Already connected or invitation pending
- API rate limits

**Solution**:
- Check connection status first
- Verify profile ID is a valid vanity name (contains hyphens, not just letters/numbers)
- Wait a few minutes between requests

### LLM empty response errors
**Problem**: "Invalid response from LLM call - None or empty"

**Solution**:
- Clear history and try again
- Use simpler, more direct commands
- Reduce number of items processed at once
- Check that API keys are valid

### Profile ID issues
**Problem**: "Failed to get profile URN" error

**Cause**: Some profiles return internal LinkedIn IDs instead of vanity names. These cannot be used for connection requests.

**Solution**: The agent will skip invalid profiles automatically. Try a different job/company.

## 📚 Learn More

- [CrewAI Documentation](https://docs.crewai.com)
- [ConnectSafely.ai API](https://connectsafely.ai/docs)
- [Streamlit Documentation](https://docs.streamlit.io)
- [Google Gemini API](https://ai.google.dev/docs)

## 🤝 Contributing

This is part of the agentic-framework-examples repository demonstrating different agent frameworks for the same use case.

## 📄 License

See LICENSE file in the repository root.
