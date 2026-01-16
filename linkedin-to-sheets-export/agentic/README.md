# LinkedIn to Sheets Export - Agentic Framework Implementations

This directory contains multiple implementations of the LinkedIn to Sheets Export agent using different agentic frameworks. Each implementation demonstrates how to build the same functionality using different tools and approaches.

## Overview

All implementations provide the same core functionality:

1. **Search LinkedIn Profiles** - Find people by keywords, location, and job title
2. **Export to Google Sheets** - Directly append results to a spreadsheet
3. **Export to JSON** - Save results locally as JSON files

## Framework Comparison

| Feature              | AutoGen       | CrewAI        | LangGraph     | Mastra        |
| -------------------- | ------------- | ------------- | ------------- | ------------- |
| **Language**         | Python        | Python        | TypeScript    | TypeScript    |
| **UI Type**          | Streamlit Web | Streamlit Web | CLI           | Mastra UI     |
| **Architecture**     | Single Agent  | Single Agent  | State Graph   | Agent Config  |
| **Memory**           | Custom        | Built-in      | State-based   | LibSQL        |
| **Best For**         | Modular code  | Task flows    | Complex flows | Quick setup   |
| **Setup Complexity** | Medium        | Medium        | Medium        | Low           |

## Quick Start Guide

### Prerequisites (All Frameworks)

1. **ConnectSafely.ai API Token**
   - Sign up at [connectsafely.ai](https://connectsafely.ai)
   - Go to Dashboard → Settings → API Keys
   - Copy your API token

2. **Google Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an API key
   - Copy the key

3. **Google Sheets Credentials** (Optional - for Sheets export)
   - Create a Google Cloud project
   - Enable Google Sheets API
   - Create a service account
   - Download the JSON credentials file
   - Share your spreadsheet with the service account email

### Choose Your Framework

#### Python Developers (Streamlit Web UI)

```bash
# AutoGen
cd autogen
cp .env.example .env
# Edit .env with your API keys
uv sync
uv run streamlit run App.py

# OR CrewAI
cd crewai
cp .env.example .env
# Edit .env with your API keys
uv sync
uv run streamlit run App.py
```

#### TypeScript Developers

```bash
# LangGraph (CLI)
cd langGraph
cp .env.example .env
# Edit .env with your API keys
bun install
bun run dev

# OR Mastra (Web UI)
cd mastra
cp .env.example .env
# Edit .env with your API keys
bun install
bun run dev
```

## Common Tools

All frameworks implement these tools:

### search-geo-location

Convert location names to LinkedIn geo IDs.

```
Input: "United States"
Output: { location_id: "103644278", location_name: "United States" }
```

### search-people

Search for LinkedIn profiles.

```
Input: {
  keywords: "CEO SaaS",
  location: "United States",
  title: "Head of Growth",
  limit: 100
}
Output: {
  people: [...],
  count: 50,
  hasMore: true
}
```

### export-to-sheets

Export results to Google Sheets.

```
Input: {
  people: [...],
  spreadsheetId: "1abc123xyz",
  sheetName: "Sheet1"
}
Output: {
  success: true,
  rowsExported: 50,
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1abc123xyz"
}
```

### export-to-json

Export results to a JSON file.

```
Input: {
  people: [...],
  filename: "leads.json"
}
Output: {
  success: true,
  filePath: "/path/to/leads.json",
  recordsExported: 50
}
```

## Example Workflow

### Step 1: Search for Profiles

```
You: Search for 50 CEOs in United States with title "Head of Growth"
```

### Step 2: Review Results

```
Agent: Found 50 profiles matching your criteria:
- John Smith - CEO at TechCorp
- Jane Doe - Head of Growth at StartupXYZ
- ...

Would you like to export these results?
```

### Step 3: Export to Sheets

```
You: Export to Google Sheets
```

### Step 4: Get Results

```
Agent: Successfully exported 50 profiles to Google Sheets.
URL: https://docs.google.com/spreadsheets/d/1abc123xyz
```

## Data Format

All exports include these fields:

| Field            | Description                          |
| ---------------- | ------------------------------------ |
| profileUrl       | LinkedIn profile URL                 |
| fullName         | Full name                            |
| firstName        | First name                           |
| lastName         | Last name                            |
| headline         | LinkedIn headline                    |
| currentPosition  | Current job title                    |
| company          | Current company (extracted)          |
| location         | Location                             |
| connectionDegree | 1st, 2nd, 3rd connection            |
| isPremium        | Premium account status               |
| isOpenToWork     | Open to work status                  |
| profilePicture   | Profile picture URL                  |
| profileId        | LinkedIn profile ID                  |
| extractedAt      | Timestamp of extraction              |

## Troubleshooting

### Common Issues

**"CONNECTSAFELY_API_TOKEN not set"**
- Ensure your `.env` file exists and contains the token
- Restart the application after updating `.env`

**"Google Sheets credentials not found"**
- Verify the path to your service account JSON file
- Ensure the file exists at the specified path

**"Permission denied" on Sheets export**
- Share your spreadsheet with the service account email
- The email looks like: `name@project.iam.gserviceaccount.com`

**"No results found"**
- Try broader search terms
- Check if the location name is valid
- Reduce the limit to see if any results are returned

## Learn More

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Mastra Documentation](https://mastra.ai/docs)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)
