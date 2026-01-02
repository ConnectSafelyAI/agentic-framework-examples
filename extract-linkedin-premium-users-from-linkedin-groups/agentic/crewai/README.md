# LinkedIn Premium Member Extractor (CrewAI)

A powerful AI agent system built with **CrewAI** that leverages the **ConnectSafely.ai** API to extract, filter, and export high-value LinkedIn group members.

This tool automates the process of finding potential leads by fetching members from LinkedIn groups and intelligently filtering for Premium and Verified profiles using a team of specialized AI agents.

## 🚀 Powered by ConnectSafely.ai

This project relies on [ConnectSafely.ai](https://connectsafely.ai) for reliable and safe LinkedIn data extraction.

**ConnectSafely.ai** provides the essential infrastructure for this agent:
*   **Safe & Compliant:** Handles LinkedIn session management and rate limiting automatically.
*   **Rich Data:** Returns detailed profile information including premium status, badges, and verification status.
*   **Simple API:** easy-to-use endpoints for fetching group members, profiles, and more.

## ✨ Features

*   ** automated Extraction:** Fetches thousands of members from any LinkedIn group you are part of.
*   **Intelligent Filtering:** Agents analyze profiles to identify Premium subscribers and Verified users (high-value leads).
*   **Google Sheets Export:** Automatically saves filtered leads to a formatted Google Sheet.
*   **Multi-Agent Workflow:**
    *   🕵️ **LinkedIn Researcher:** Interfaces with ConnectSafely.ai to gather raw data.
    *   🔍 **Data Analyst:** Filters and validates profiles based on premium indicators.
    *   📊 **Spreadsheet Manager:** Handles data formatting and export.
*   **Streamlit UI:** User-friendly web interface to control the agents.

## 🛠️ Prerequisites

1.  **Python 3.10+**
2.  **uv** (recommended for package management)
3.  **API Keys:**
    *   `CONNECTSAFELY_API_TOKEN`: Get it from the [ConnectSafely Dashboard](https://connectsafely.ai/dashboard).
    *   `GEMINI_API_KEY`: For the AI agents (Google AI Studio).
    *   `GOOGLE_CLIENT_ID` / `SECRET` / `REFRESH_TOKEN`: For Google Sheets export (Optional).

## 📦 Installation

This project uses `uv` for fast and reliable dependency management.

```bash
# Navigate to the directory
cd extract-linkedin-premium-users-from-linkedin-groups/agentic/crewai

# Install dependencies
uv sync
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Required
CONNECTSAFELY_API_TOKEN=your_token_here
GEMINI_API_KEY=your_gemini_key_here

# Optional (for Google Sheets Export)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

## 🚀 Usage

Start the application with a single command:

```bash
uv run streamlit run App.py
```

### Workflow Options
1.  **Complete Workflow (Recommended):** Fast execution where one agent handles fetching and filtering.
2.  **Multi-Step Workflow:** Detailed execution where separate agents handle research, analysis, and export.
3.  **Fetch Only:** Just downloads the raw member data without filtering.

## 📁 Project Structure

```text
crewai/
├── agents/             # AI Agent definitions
├── tasks/              # Task definitions (Fetch, Filter, Export)
├── tools/              # Custom tools
│   ├── Linkedin/       # ConnectSafely.ai integration tools
│   └── googleSheet/    # Google Sheets API tools
├── App.py              # Streamlit User Interface
├── crew.py             # Main CrewAI orchestration logic
└── pyproject.toml      # Dependency configuration
```

## 📄 License

MIT License
