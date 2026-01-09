# LinkedIn Premium Members Extractor (Agno)

**AI Agent powered by [ConnectSafely.ai](https://connectsafely.ai)** - Extract and filter LinkedIn group members using natural language commands with the Agno framework.

## 🌟 About ConnectSafely.ai

**[ConnectSafely.ai](https://connectsafely.ai)** is the premier LinkedIn automation platform that provides enterprise-grade APIs for safe and compliant LinkedIn data extraction. This Agno agent leverages ConnectSafely.ai's robust infrastructure to:

- 🔍 **Extract LinkedIn Group Members** - Fetch member profiles from any LinkedIn group you're part of
- ⚡ **Automatic Pagination** - Handle large groups seamlessly with built-in pagination support
- 📊 **Rich Profile Data** - Get comprehensive member details including Premium/Verified status, badges, and profile information
- 🛡️ **Compliant & Safe** - No web scraping; uses official LinkedIn APIs through ConnectSafely.ai
- 🚀 **High Performance** - Fast, reliable API with generous rate limits
- 🔐 **Secure Authentication** - Simple API key-based authentication

### Why ConnectSafely.ai?

✅ **Enterprise-Grade Reliability** - Production-ready infrastructure with 99.9% uptime  
✅ **Comprehensive Data** - Full profile information including premium badges and verification status  
✅ **Easy Integration** - Simple REST API with clear documentation  
✅ **Compliant Operations** - Follows LinkedIn's terms of service  
✅ **Scalable** - Handle groups with thousands of members efficiently  
✅ **Active Support** - Responsive support team and regular updates

**Get your API key:** [https://connectsafely.ai](https://connectsafely.ai)

---

## 🚀 Features

### ConnectSafely.ai Integration
This agent uses **5 ConnectSafely.ai API endpoints**:

1. **Fetch Group Members** (`/linkedin/groups/members`) - Extract members with pagination control
2. **Fetch All Members** - Auto-pagination for complete group data extraction
3. **URL Resolution** - Convert LinkedIn group URLs to group IDs
4. **Premium Filtering** - Filter by LinkedIn Premium badge status
5. **Verified Filtering** - Filter by LinkedIn Verified status

### AI-Powered Workflow
- **🤖 Natural Language Interface** - Describe what you want in plain English
- **🧠 Intelligent Tool Selection** - Agno agent automatically picks the right ConnectSafely.ai endpoint
- **⚙️ Multi-Step Orchestration** - Chains multiple API calls intelligently
- **📊 Google Sheets Export** - Save extracted members directly to spreadsheets
- **🔄 Memory & Context** - Agent remembers previous results for follow-up commands

### Two Interfaces
- **CLI Mode** - Run commands directly from terminal
- **Streamlit UI** - Beautiful web interface for interactive workflows

---

## 🛠️ Prerequisites

1. **Python 3.12+**
2. **uv** (recommended package manager) - [Install uv](https://github.com/astral-sh/uv)
3. **API Keys:**
   - `CONNECTSAFELY_API_TOKEN` - Get from [ConnectSafely.ai Dashboard](https://connectsafely.ai/dashboard)
   - `GOOGLE_API_KEY` - For Gemini AI model ([Google AI Studio](https://aistudio.google.com/api-keys))
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` - For Google Sheets export (optional)

---

## 📦 Installation

This project uses `uv` for fast and reliable dependency management.

```bash
# Navigate to the agno directory
cd extract-linkedin-premium-users-from-linkedin-groups/agentic/agno

# Install dependencies
uv sync
```

---

## ⚙️ Configuration

Create a `.env` file in the `agno` directory:

```env
# Required: ConnectSafely.ai API Token
CONNECTSAFELY_API_TOKEN=your_connectsafely_token_here

# Required: Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Google Sheets Export
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### Getting Your ConnectSafely.ai API Token

1. Sign up at [https://connectsafely.ai](https://connectsafely.ai)
2. Navigate to your dashboard
3. Generate an API token
4. Copy the token to your `.env` file

---

## 🚀 Usage

### CLI Mode

Run the agent directly from the command line:

```bash
# Using uv (recommended)
uv run python agents/agent.py

# Or with Python directly
python agents/agent.py
```

The agent will execute the default command. To customize, edit the `main()` function in `agents/agent.py`.

**Example commands you can use:**
- `"fetch 100 premium members from group id 9357376 and export them to a google sheet titled 'Agno100'"`
- `"fetch all members from group id 9357376"`
- `"get premium members from group https://www.linkedin.com/groups/123456"`

### Streamlit UI (Interactive Mode)

Launch the web interface:

```bash
uv run streamlit run App.py
```

The UI will open in your browser at `http://localhost:8501`.

#### Workflow Types

1. **Complete Workflow** (Recommended)
   - Fetches premium/verified members and automatically exports to Google Sheets in one step
   - Requires Sheet Title
   - Fastest option for end-to-end automation

2. **Multi-Step Workflow**
   - Fetches members first, then allows separate export step
   - Sheet Title is optional
   - Good for reviewing data before export

3. **Fetch Only**
   - Just fetches the members without exporting
   - Sheet Title is not used
   - Useful for data inspection

#### Input Fields

- **Group ID**: The LinkedIn group ID (e.g., `9357376`)
- **Limit Members**: Maximum number of members to fetch
- **Sheet Title**: Title for the Google Sheet (required for Complete Workflow)

---

## 📁 Project Structure

```
agno/
├── agents/
│   └── agent.py              # CLI agent definition
├── tools/
│   ├── linkedin/             # ConnectSafely.ai integration tools
│   │   ├── fetch_linkedIn_group_members_tool.py
│   │   ├── fetch_all_linkedIn_group_members_tool.py
│   │   ├── fetch_group_members_by_url_tool.py
│   │   ├── filter_premium_verified_members_tool.py
│   │   └── complete_group_members_workflow_tool.py
│   └── googlesheet/          # Google Sheets export tools
│       ├── export_members_to_sheets_tool.py
│       └── google_sheets_tool.py
├── App.py                    # Streamlit web interface
├── pyproject.toml            # Dependencies and project config
└── README.md                 # This file
```

---

## 🔧 How It Works

### ConnectSafely.ai API Integration

All LinkedIn operations go through ConnectSafely.ai's REST API:

```python
# Example: Fetching group members
url = "https://api.connectsafely.ai/linkedin/groups/members"
headers = {
    "Authorization": f"Bearer {CONNECTSAFELY_API_TOKEN}",
    "Content-Type": "application/json",
}
payload = {
    "groupId": "9357376",
    "start": 0,
    "count": 50
}
```

### Agent Workflow

1. **User Request** → Natural language command
2. **Agno Agent** → Analyzes intent using Gemini 3 Pro
3. **Tool Selection** → Chooses appropriate ConnectSafely.ai endpoint
4. **API Call** → Fetches data from ConnectSafely.ai
5. **Processing** → Filters for Premium/Verified members
6. **Export** → Optionally saves to Google Sheets

### Available Tools

| Tool | ConnectSafely.ai Endpoint | Description |
|------|---------------------------|-------------|
| `fetch_linkedin_group_members` | `/linkedin/groups/members` | Single paginated batch |
| `fetch_all_linkedin_group_members` | `/linkedin/groups/members` | Auto-pagination for all members |
| `fetch_group_members_by_url` | `/linkedin/groups/members` | URL to ID conversion + fetch |
| `filter_premium_verified_members` | N/A | Client-side filtering |
| `complete_group_members_workflow` | `/linkedin/groups/members` | Fetch + filter in one step |
| `export_members_to_sheets` | N/A | Google Sheets export |

---

## 📊 Example Workflows

### Example 1: Fetch Premium Members

```python
# Agent command
"fetch 100 premium members from group id 9357376"

# Agent automatically:
# 1. Calls complete_group_members_workflow
# 2. Fetches members via ConnectSafely.ai
# 3. Filters for Premium/Verified
# 4. Returns JSON result
```

### Example 2: Export to Google Sheets

```python
# Agent command
"fetch 50 premium members from group id 9357376 and export them to a google sheet titled 'Leads'"

# Agent automatically:
# 1. Fetches and filters members
# 2. Passes result to export_members_to_sheets
# 3. Creates/updates Google Sheet
# 4. Returns sheet URL
```

### Example 3: Using Group URL

```python
# Agent command
"get premium members from https://www.linkedin.com/groups/9357376"

# Agent automatically:
# 1. Extracts group ID from URL
# 2. Fetches members via ConnectSafely.ai
# 3. Filters for Premium/Verified
```

---

## 🐛 Troubleshooting

### ConnectSafely.ai API Errors

**401 Unauthorized**
- Check your `CONNECTSAFELY_API_TOKEN` in `.env`
- Verify token is still valid at [ConnectSafely.ai dashboard](https://connectsafely.ai)
- Regenerate token if expired

**404 Group Not Found**
- Verify group ID is correct
- Check if group is public/accessible
- Ensure you're a member of the group
- Try using the full LinkedIn group URL instead

**Rate Limiting**
- ConnectSafely.ai has generous limits
- If you hit limits, add delays between requests
- Contact ConnectSafely.ai support for higher limits

**Empty Results**
- Verify you're a member of the group
- Check if group has members
- Try a different group ID

### Agent Errors

**"GOOGLE_API_KEY not found"**
- Ensure `.env` file exists in project root
- Verify `GOOGLE_API_KEY` is set correctly
- Check for typos in variable name

**"Module not found" errors**
- Run `uv sync` to install dependencies
- Verify you're in the correct directory
- Check Python version (requires 3.12+)

**Google Sheets Export Fails**
- Verify Google OAuth2 credentials are configured
- Check Google Sheets API is enabled in Cloud Console
- Ensure refresh token is valid

---

## 🌐 ConnectSafely.ai Resources

- **Website**: [https://connectsafely.ai](https://connectsafely.ai)
- **Dashboard**: [https://connectsafely.ai/dashboard](https://connectsafely.ai/dashboard)
- **API Documentation**: Available in your ConnectSafely.ai dashboard
- **Support**: Contact ConnectSafely.ai support team through dashboard
- **Status Page**: Monitor API uptime and performance

---

## 🔧 Tech Stack

- **[ConnectSafely.ai](https://connectsafely.ai)** - LinkedIn data extraction API (primary integration)
- **[Agno](https://github.com/agno-ai/agno)** - AI agent framework
- **Google Gemini 3 Pro** - Large language model for intent understanding
- **Google Sheets API** - Export and storage
- **Streamlit** - Web interface
- **httpx** - HTTP client for API calls
- **uv** - Fast Python package manager

---

## 📚 Learn More

### ConnectSafely.ai
- Primary documentation in your ConnectSafely.ai dashboard
- API reference and examples
- Rate limits and pricing information
- Best practices for LinkedIn automation

### Agno Framework
- [Agno Documentation](https://github.com/agno-ai/agno)
- Agent configuration and tool development
- Model integration guides

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

This project is powered by:
- **[ConnectSafely.ai](https://connectsafely.ai)** - For providing reliable LinkedIn automation APIs
- **Agno** - For the excellent AI agent framework
- **Google Gemini** - For intelligent natural language understanding

---

**Ready to extract LinkedIn premium members? Get started with [ConnectSafely.ai](https://connectsafely.ai) today!** 🚀

