import os
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from tools.linkedin.fetch_all_linkedIn_group_members_tool import fetch_all_linkedin_group_members
from tools.linkedin.complete_group_members_workflow_tool import complete_group_members_workflow
from tools.linkedin.fetch_linkedIn_group_members_tool import fetch_linkedin_group_members
from tools.linkedin.fetch_group_members_by_url_tool import fetch_group_members_by_url
from tools.linkedin.filter_premium_verified_members_tool import filter_premium_verified_members
from tools.googlesheet.export_members_to_sheets_tool import export_members_to_sheets

load_dotenv()

# uv tip: You can use 'uv run' to automatically manage env vars
# but for now, we ensure the key is present
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Initialize the Gemini-powered Agent
agent = Agent(
    model=Gemini(id="gemini-3-pro-preview"),
    tools=[
        fetch_all_linkedin_group_members,
        complete_group_members_workflow,
        fetch_linkedin_group_members,
        fetch_group_members_by_url,
        filter_premium_verified_members,
        export_members_to_sheets,
    ],
    instructions=[
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
    ],
    markdown=True,
)

def main():
    agent.print_response("fetch 100 premium members from group id 9357376 and export them to a google sheet titled 'Agno100'")

if __name__ == "__main__":
    main()