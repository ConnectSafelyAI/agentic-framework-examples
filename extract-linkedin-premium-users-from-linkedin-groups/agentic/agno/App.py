"""Main Streamlit application for LinkedIn Group Members Agent."""

import streamlit as st
from config.constants import PAGE_CONFIG, WORKFLOW_TYPES, HELP_TEXT, FOOTER_HELP_TEXT
from config.agent_setup import initialize_agent, initialize_session_state
from config.workflows import execute_workflow

# Page configuration
st.set_page_config(**PAGE_CONFIG)

# Initialize session state and agent
initialize_session_state()
agent = initialize_agent()

# Main content area
st.title("🔗 LinkedIn Group Premium Members Extractor Agent")
st.markdown("**Powered by Agno & ConnectSafely.ai**")

# Workflow selection
workflow_type = st.radio(
    "Select Workflow Type:",
    WORKFLOW_TYPES,
    horizontal=True,
    help=HELP_TEXT["workflow"]
)

st.divider()

# Input fields
col1, col2 = st.columns(2)

with col1:
    group_id = st.text_input(
        "Group ID",
        placeholder="e.g., 9357376",
        help=HELP_TEXT["group_id"]
    )

with col2:
    limit_members = st.number_input(
        "Limit Members",
        min_value=1,
        value=10,
        step=1,
        help=HELP_TEXT["limit_members"]
    )

sheet_title = st.text_input(
    "Sheet Title",
    placeholder="e.g., Test Sheet",
    help=HELP_TEXT["sheet_title"]
)

st.divider()

# Execute button
if st.button("🚀 Execute Workflow", use_container_width=True, type="primary"):
    execute_workflow(agent, workflow_type, group_id, limit_members, sheet_title)

# Display last result in expandable section
if st.session_state.last_result:
    st.divider()
    with st.expander("📋 View Last Result", expanded=False):
        result = st.session_state.last_result
        display_text = result[:1000] + "..." if len(result) > 1000 else result
        st.text(display_text)

# Footer with info
st.divider()
with st.expander("ℹ️ How to use"):
    st.markdown(FOOTER_HELP_TEXT)
