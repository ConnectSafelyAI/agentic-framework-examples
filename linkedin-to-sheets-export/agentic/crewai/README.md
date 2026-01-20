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
- Google OAuth credentials (optional, for Sheets export)

### Installation

```bash
# Clone and navigate
cd linkedin-to-sheets-export/agentic/crewai

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# CONNECTSAFELY_API_TOKEN=your_token
# GEMINI_API_KEY=your_key
# For Google Sheets export (optional):
# GOOGLE_CLIENT_ID=your_oauth_client_id
# GOOGLE_CLIENT_SECRET=your_oauth_client_secret
# GOOGLE_REFRESH_TOKEN=your_refresh_token

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
| GOOGLE_CLIENT_ID                | No       | Google OAuth client ID (for Sheets)  |
| GOOGLE_CLIENT_SECRET            | No       | Google OAuth client secret           |
| GOOGLE_REFRESH_TOKEN            | No       | Google OAuth refresh token           |

### Google OAuth Setup (Optional - for Sheets Export)

To enable Google Sheets export with OAuth authentication:

1. **Create OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop app" as application type
   - Download the credentials JSON

2. **Get Refresh Token**:
   - Use the OAuth client ID and secret to generate a refresh token
   - You can use tools like [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - Required scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive`

3. **Set Environment Variables**:
   - Add to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     GOOGLE_REFRESH_TOKEN=your_refresh_token
     ```

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
│   ├── export_to_json_tool.py       # JSON export
│   └── googlesheet/                 # Google Sheets export module
│       ├── auth.py                  # OAuth authentication
│       ├── client.py                # Google Sheets API client
│       └── export_to_sheets.py      # Export tool
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
    spreadsheet_title: Optional[str] = None,
    sheet_name: str = "LinkedIn People"
) -> Dict[str, Any]:
    """Export search results to Google Sheets using OAuth authentication.
    Automatically creates spreadsheet if ID not provided, with duplicate detection."""
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

**Export fails with authentication error**
- Verify OAuth credentials are set correctly in .env
- Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are valid
- Check that refresh token hasn't expired

### Tips for Better Results

1. **Start small**: Begin with 25-50 results to test
2. **Be specific**: Include location and title for better matches
3. **Clear context**: Reset between different search types
4. **Check credentials**: Verify all API keys are valid

## Learn More

- [CrewAI Documentation](https://docs.crewai.com/)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
