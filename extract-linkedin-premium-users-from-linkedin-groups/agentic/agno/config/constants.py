"""Constants and configuration for the LinkedIn Group Members Agent."""

# Page configuration
PAGE_CONFIG = {
    "page_title": "LinkedIn Premium Member Extractor",
    "page_icon": "🔗",
    "layout": "wide",
    "initial_sidebar_state": "collapsed"
}

# Workflow types
WORKFLOW_TYPES = ["Complete Workflow", "Multi-Step Workflow", "Fetch Only"]

# Help text
HELP_TEXT = {
    "workflow": "Choose how you want to process the members",
    "group_id": "Enter the LinkedIn group ID",
    "limit_members": "Maximum number of members to fetch",
    "sheet_title": "Title for the Google Sheet (required for Complete Workflow)"
}

# Agent instructions
AGENT_INSTRUCTIONS = [
    "You are a LinkedIn automation agent.",
    "Your goal is to extract group members and filter for Premium/Verified profiles.",
    "## MANDATORY RULES",
    "1. Use the simplest tool that satisfies the request.",
    "2. complete_group_members_workflow never handles Google Sheets.",
    "3. Do not narrate internal reasoning; be concise and deterministic.",
    "4. When exporting to Google Sheets:",
    "   a. First call complete_group_members_workflow or fetch_all_linkedin_group_members",
    "   b. Take the entire JSON string result and pass it to export_members_to_sheets",
    "   c. NEVER try to parse or extract the members yourself",
    "## RECOMMENDED FLOWS",
    "For premium members export: complete_group_members_workflow → export_members_to_sheets",
    "For all members export: fetch_all_linkedin_group_members → export_members_to_sheets",
    "If a user provides a group URL: First use fetch_group_members_by_url, then continue.",
    "## MEMORY LOGIC",
    "When members are fetched, treat the result as the working set.",
    "If the user says 'them' or 'those', reuse the last fetched data.",
]

# Footer help text
FOOTER_HELP_TEXT = """
### Workflow Types:

1. **Complete Workflow**: Fetches premium/verified members and automatically exports them to Google Sheets in one step. Requires Sheet Title.

2. **Multi-Step Workflow**: Fetches members first, then allows you to export them separately. Sheet Title is optional.

3. **Fetch Only**: Just fetches the members without exporting. Sheet Title is not used.

### Input Fields:
- **Group ID**: The LinkedIn group ID (e.g., 9357376)
- **Limit Members**: Maximum number of members to fetch
- **Sheet Title**: Title for the Google Sheet (required for Complete Workflow)

### Features:
- ✅ Automatic pagination for large groups
- ✅ Premium/Verified member filtering
- ✅ Google Sheets integration
- ✅ Duplicate detection in sheets
"""

