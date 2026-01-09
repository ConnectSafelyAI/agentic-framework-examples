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
import json

load_dotenv()

# Page configuration
st.set_page_config(
    page_title="LinkedIn Group Members Agent",
    page_icon="🔗",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Initialize session state
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

if "last_result" not in st.session_state:
    st.session_state.last_result = None

# Main content area
st.title("🔗 LinkedIn Group Members Agent")
st.markdown("Automate LinkedIn group member extraction and filtering with AI-powered workflows.")

# Workflow selection
workflow_type = st.radio(
    "Select Workflow Type:",
    ["Complete Workflow", "Multi-Step Workflow", "Fetch Only"],
    horizontal=True,
    help="Choose how you want to process the members"
)

st.divider()

# Input fields
col1, col2 = st.columns(2)

with col1:
    group_id = st.text_input(
        "Group ID",
        placeholder="e.g., 9357376",
        help="Enter the LinkedIn group ID"
    )

with col2:
    limit_members = st.number_input(
        "Limit Members",
        min_value=1,
        value=10,
        step=1,
        help="Maximum number of members to fetch"
    )

sheet_title = st.text_input(
    "Sheet Title",
    placeholder="e.g., Test Sheet",
    help="Title for the Google Sheet (required for Complete Workflow)"
)

st.divider()

# Execute button
if st.button("🚀 Execute Workflow", use_container_width=True, type="primary"):
    if not group_id:
        st.error("⚠️ Please enter a Group ID")
    else:
        if workflow_type == "Complete Workflow":
            if not sheet_title:
                st.error("⚠️ Sheet Title is required for Complete Workflow")
            else:
                # Complete workflow: fetch premium members and export to sheets in one go
                query = f"fetch {limit_members} premium members from group id {group_id} and add them to a google sheet titled '{sheet_title}'"
                
                with st.spinner("🔄 Fetching premium members and exporting to Google Sheets..."):
                    try:
                        response = st.session_state.agent.run(query)
                        st.session_state.last_result = response.content
                        st.success("✅ Complete workflow executed successfully!")
                        st.markdown("### Result:")
                        st.markdown(response.content)
                    except Exception as e:
                        st.error(f"❌ Error: {str(e)}")
        
        elif workflow_type == "Multi-Step Workflow":
            # Multi-step: fetch first, then optionally export
            query = f"fetch {limit_members} premium members from group id {group_id}"
            
            with st.spinner("🔄 Step 1: Fetching premium members..."):
                try:
                    response = st.session_state.agent.run(query)
                    st.session_state.last_result = response.content
                    st.success("✅ Step 1 completed: Members fetched!")
                    st.markdown("### Fetch Result:")
                    st.markdown(response.content)
                    
                    if sheet_title:
                        st.divider()
                        export_query = f"add the last fetched members to a google sheet titled '{sheet_title}'"
                        with st.spinner("🔄 Step 2: Exporting to Google Sheets..."):
                            try:
                                export_response = st.session_state.agent.run(export_query)
                                st.success("✅ Step 2 completed: Exported to Google Sheets!")
                                st.markdown("### Export Result:")
                                st.markdown(export_response.content)
                            except Exception as e:
                                st.error(f"❌ Export Error: {str(e)}")
                    else:
                        st.info("💡 Enter a Sheet Title to export the fetched members to Google Sheets")
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
        
        elif workflow_type == "Fetch Only":
            # Fetch only: just get the members, no export
            query = f"fetch {limit_members} premium members from group id {group_id}"
            
            with st.spinner("🔄 Fetching members..."):
                try:
                    response = st.session_state.agent.run(query)
                    st.session_state.last_result = response.content
                    st.success("✅ Members fetched successfully!")
                    st.markdown("### Result:")
                    st.markdown(response.content)
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

# Display last result in expandable section
if st.session_state.last_result:
    st.divider()
    with st.expander("📋 View Last Result", expanded=False):
        st.text(st.session_state.last_result[:1000] + "..." if len(st.session_state.last_result) > 1000 else st.session_state.last_result)

# Footer with info
st.divider()
with st.expander("ℹ️ How to use"):
    st.markdown("""
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
    """)