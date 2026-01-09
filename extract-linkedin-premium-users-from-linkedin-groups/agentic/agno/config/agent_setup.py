"""Agent setup and initialization."""

import os
import streamlit as st
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from tools.linkedin.fetch_all_linkedIn_group_members_tool import fetch_all_linkedin_group_members
from tools.linkedin.complete_group_members_workflow_tool import complete_group_members_workflow
from tools.linkedin.fetch_linkedIn_group_members_tool import fetch_linkedin_group_members
from tools.linkedin.fetch_group_members_by_url_tool import fetch_group_members_by_url
from tools.linkedin.filter_premium_verified_members_tool import filter_premium_verified_members
from tools.googlesheet.export_members_to_sheets_tool import export_members_to_sheets
from config.constants import AGENT_INSTRUCTIONS

load_dotenv()


def initialize_agent():
    """Initialize and return the agent if not already in session state."""
    if "agent" not in st.session_state:
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
        if not GOOGLE_API_KEY:
            st.error("⚠️ GOOGLE_API_KEY not found in environment variables.")
            st.stop()
        
        st.session_state.agent = Agent(
            model=Gemini(id="gemini-3-pro-preview"),
            tools=[
                fetch_all_linkedin_group_members,
                complete_group_members_workflow,
                fetch_linkedin_group_members,
                fetch_group_members_by_url,
                filter_premium_verified_members,
                export_members_to_sheets,
            ],
            instructions=AGENT_INSTRUCTIONS,
            markdown=True,
        )
    return st.session_state.agent


def initialize_session_state():
    """Initialize session state variables."""
    if "last_result" not in st.session_state:
        st.session_state.last_result = None

