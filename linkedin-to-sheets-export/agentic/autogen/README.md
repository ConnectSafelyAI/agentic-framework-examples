# LinkedIn to Sheets Export - AutoGen Implementation

Export LinkedIn search results to Google Sheets using AutoGen and ConnectSafely.ai.

## Overview

This implementation uses Microsoft's AutoGen framework with a modular architecture pattern. The agent handles natural language commands to search LinkedIn and export results.

## Key Features

- **Streamlit Web UI** - Clean, responsive interface
- **Modular Architecture** - All files under 100 lines for maintainability
- **Memory Management** - Persistent context across commands
- **Dual Export** - Google Sheets and JSON support

## Screenshots

![Streamlit Interface](assets/streamlit-ui.png)

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
cd linkedin-to-sheets-export/agentic/autogen

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
"Find 100 marketing directors in New York with title 'VP'"
"Search for CTOs in London"

# Export commands
"Export to Google Sheets"
"Export results to JSON"
"Export to both Sheets and JSON"

# Follow-up commands
"Export just the first 25 results"
"Search again with different keywords"
```

## Architecture

```
autogen/
├── App.py                      # Streamlit UI entry point
├── autogen_client.py           # Client wrapper for agent
├── workflows.py                # Workflow handler
├── pyproject.toml              # Dependencies
├── .env.example                # Environment template
├── agents/
│   ├── __init__.py
│   ├── assistant.py            # Main LinkedInExportAssistant class
│   └── config/
│       ├── __init__.py
│       ├── agent_factory.py    # Agent creation & model config
│       ├── response_processor.py # Response cleaning
│       ├── memory_manager.py   # Search results memory
│       └── execution_utils.py  # Execution helpers
├── tools/
│   ├── __init__.py
│   ├── search_geo_location_tool.py  # Location search
│   ├── search_people_tool.py        # People search
│   ├── export_to_sheets_tool.py     # Sheets export
│   └── export_to_json_tool.py       # JSON export
└── assets/
```

## Available Tools

### search_geo_location

Converts location names to LinkedIn geo IDs.

```python
result = search_geo_location("United States")
# Returns: { "location_id": "103644278", "location_name": "United States" }
```

### search_people

Searches for LinkedIn profiles.

```python
result = search_people(
    keywords="CEO SaaS",
    location="United States",
    title="Head of Growth",
    limit=100
)
# Returns: { "people": [...], "count": 50, "hasMore": true }
```

### export_to_sheets

Exports results to Google Sheets.

```python
result = export_to_sheets(
    people=search_results["people"],
    spreadsheet_id="1abc123xyz",
    sheet_name="Sheet1"
)
# Returns: { "success": true, "rows_exported": 50, "spreadsheet_url": "..." }
```

### export_to_json

Exports results to JSON file.

```python
result = export_to_json(
    people=search_results["people"],
    filename="leads.json"
)
# Returns: { "success": true, "file_path": "/path/to/leads.json" }
```

## Typical Workflows

### Lead Generation Workflow

```
1. "Search for 100 CEOs in technology companies in Bay Area"
2. Agent searches and returns results
3. "Export to Google Sheets"
4. Agent exports and provides spreadsheet URL
5. Open spreadsheet for outreach campaign
```

### Market Research Workflow

```
1. "Find 50 Marketing VPs in United States"
2. Review the results summary
3. "Export to JSON for analysis"
4. Use JSON data in your analysis tools
```

## Troubleshooting

### Common Issues

**"GEMINI_API_KEY not found"**
- Ensure GEMINI_API_KEY is set in your .env file
- Restart the Streamlit app after updating .env

**"Context is large" warning**
- Click "Clear History & Reset" in the sidebar
- This resets the agent's memory

**Google Sheets export fails**
- Verify service account JSON path is correct
- Ensure spreadsheet is shared with service account email
- Check that the spreadsheet ID is correct

**No results found**
- Try broader search terms
- Verify location name is valid
- Check API token is valid

### Debug Mode

Enable verbose logging by setting:

```python
# In autogen_client.py
os.environ["AUTOGEN_DEBUG"] = "true"
```

## Learn More

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
