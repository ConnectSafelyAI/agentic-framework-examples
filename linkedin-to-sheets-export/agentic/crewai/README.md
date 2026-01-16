# LinkedIn to Sheets Export - CrewAI Implementation

Export LinkedIn search results to Google Sheets using CrewAI and ConnectSafely.ai.

## Overview

This implementation uses CrewAI's task-based agent framework with a Streamlit web interface. The agent handles natural language commands to search LinkedIn and export results.

## Key Features

- **Streamlit Web UI** - Clean, responsive interface
- **Task-Based Execution** - Commands map to specific tasks
- **Built-in Memory** - CrewAI's native memory system
- **Dual Export** - Google Sheets and JSON support

## Quick Start

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) package manager
- ConnectSafely.ai API token
- Google Gemini API key
- Google Sheets credentials (optional)

### Installation

```bash
# Clone and navigate
cd linkedin-to-sheets-export/agentic/crewai

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# CONNECTSAFELY_API_TOKEN=your_token
# GEMINI_API_KEY=your_key
# GOOGLE_SHEETS_CREDENTIALS_FILE=/path/to/creds.json
# GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id

# Install dependencies
uv sync

# Run the application
uv run streamlit run App.py
```

### Environment Variables

| Variable                        | Required | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| CONNECTSAFELY_API_TOKEN         | Yes      | ConnectSafely.ai API token           |
| GEMINI_API_KEY                  | Yes      | Google Gemini API key                |
| GOOGLE_SHEETS_CREDENTIALS_FILE  | No       | Path to service account JSON         |
| GOOGLE_SHEETS_SPREADSHEET_ID    | No       | Default spreadsheet ID               |

## How to Use

### Basic Workflow

1. **Start the app**: `uv run streamlit run App.py`
2. **Search for profiles**: "Search for 50 CEOs in United States"
3. **Review results**: Agent shows count and sample profiles
4. **Export**: "Export to Google Sheets" or "Export to JSON"

### Example Commands

```
# Search commands
"Search for 50 software engineers in San Francisco"
"Find 100 marketing directors in New York"
"Search for CTOs in London with title 'Chief'"

# Export commands
"Export to Google Sheets"
"Save results to JSON"
"Export to both formats"

# Combined commands
"Search for 25 VPs in Texas and export to Sheets"
```

## Architecture

```
crewai/
├── App.py                      # Streamlit UI entry point
├── crew.py                     # LinkedInExportCrew wrapper
├── workflows.py                # Workflow handler
├── pyproject.toml              # Dependencies
├── .env.example                # Environment template
├── agents/
│   ├── __init__.py
│   └── agents.py               # Agent definition with tools
├── tools/
│   ├── __init__.py
│   ├── search_geo_location_tool.py  # Location search
│   ├── search_people_tool.py        # People search
│   ├── export_to_sheets_tool.py     # Sheets export
│   └── export_to_json_tool.py       # JSON export
└── assets/
```

## Available Tools

All tools use CrewAI's `@tool` decorator:

### Search Geographic Location

```python
@tool("Search Geographic Location")
def search_geo_location(keywords: str) -> Dict[str, Any]:
    """Search for geographic locations to get location IDs."""
```

### Search LinkedIn People

```python
@tool("Search LinkedIn People")
def search_people(
    keywords: str,
    location: Optional[str] = None,
    title: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """Search for LinkedIn profiles by keywords, location, and title."""
```

### Export to Google Sheets

```python
@tool("Export to Google Sheets")
def export_to_sheets(
    people: List[Dict[str, Any]],
    spreadsheet_id: Optional[str] = None,
    sheet_name: str = "Sheet1"
) -> Dict[str, Any]:
    """Export search results to Google Sheets."""
```

### Export to JSON

```python
@tool("Export to JSON")
def export_to_json(
    people: List[Dict[str, Any]],
    output_dir: Optional[str] = None,
    filename: Optional[str] = None
) -> Dict[str, Any]:
    """Export search results to a JSON file."""
```

## Agent Configuration

The agent is configured in `agents/agents.py`:

```python
agent = Agent(
    role="LinkedIn Export Specialist",
    goal="Search LinkedIn profiles and export results",
    backstory="Expert at LinkedIn data export...",
    tools=[
        search_geo_location,
        search_people,
        export_to_sheets,
        export_to_json
    ],
    llm=LLM(model="gemini/gemini-2.5-pro"),
    verbose=True,
    memory=True,
)
```

## Troubleshooting

### Common Issues

**"CrewAI telemetry" messages**
- Telemetry is disabled by default in App.py
- Set `CREWAI_TELEMETRY_OPT_OUT=true` if issues persist

**Slow responses**
- CrewAI can be verbose; this is normal
- Consider reducing search limit for faster results

**Context size warning**
- Click "Clear History" in sidebar
- Start with smaller searches (25-50 results)

**Export fails with permission error**
- Share spreadsheet with service account email
- Verify credentials file path is correct

### Tips for Better Results

1. **Start small**: Begin with 25-50 results to test
2. **Be specific**: Include location and title for better matches
3. **Clear context**: Reset between different search types
4. **Check credentials**: Verify all API keys are valid

## Learn More

- [CrewAI Documentation](https://docs.crewai.com/)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
