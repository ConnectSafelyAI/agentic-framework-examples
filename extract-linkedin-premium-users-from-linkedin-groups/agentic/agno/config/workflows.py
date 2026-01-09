"""Workflow execution handlers."""

import streamlit as st


def execute_complete_workflow(agent, group_id, limit_members, sheet_title):
    """Execute complete workflow: fetch and export in one step."""
    if not sheet_title:
        st.error("⚠️ Sheet Title is required for Complete Workflow")
        return
    
    query = f"fetch {limit_members} premium members from group id {group_id} and add them to a google sheet titled '{sheet_title}'"
    
    with st.spinner("🔄 Fetching premium members and exporting to Google Sheets..."):
        try:
            response = agent.run(query)
            st.session_state.last_result = response.content
            st.success("✅ Complete workflow executed successfully!")
            st.markdown("### Result:")
            st.markdown(response.content)
        except Exception as e:
            st.error(f"❌ Error: {str(e)}")


def execute_multi_step_workflow(agent, group_id, limit_members, sheet_title):
    """Execute multi-step workflow: fetch first, then optionally export."""
    query = f"fetch {limit_members} premium members from group id {group_id}"
    
    with st.spinner("🔄 Step 1: Fetching premium members..."):
        try:
            response = agent.run(query)
            st.session_state.last_result = response.content
            st.success("✅ Step 1 completed: Members fetched!")
            st.markdown("### Fetch Result:")
            st.markdown(response.content)
            
            if sheet_title:
                st.divider()
                export_query = f"add the last fetched members to a google sheet titled '{sheet_title}'"
                with st.spinner("🔄 Step 2: Exporting to Google Sheets..."):
                    try:
                        export_response = agent.run(export_query)
                        st.success("✅ Step 2 completed: Exported to Google Sheets!")
                        st.markdown("### Export Result:")
                        st.markdown(export_response.content)
                    except Exception as e:
                        st.error(f"❌ Export Error: {str(e)}")
            else:
                st.info("💡 Enter a Sheet Title to export the fetched members to Google Sheets")
        except Exception as e:
            st.error(f"❌ Error: {str(e)}")


def execute_fetch_only_workflow(agent, group_id, limit_members):
    """Execute fetch-only workflow."""
    query = f"fetch {limit_members} premium members from group id {group_id}"
    
    with st.spinner("🔄 Fetching members..."):
        try:
            response = agent.run(query)
            st.session_state.last_result = response.content
            st.success("✅ Members fetched successfully!")
            st.markdown("### Result:")
            st.markdown(response.content)
        except Exception as e:
            st.error(f"❌ Error: {str(e)}")


def execute_workflow(agent, workflow_type, group_id, limit_members, sheet_title):
    """Execute the appropriate workflow based on type."""
    if not group_id:
        st.error("⚠️ Please enter a Group ID")
        return
    
    if workflow_type == "Complete Workflow":
        execute_complete_workflow(agent, group_id, limit_members, sheet_title)
    elif workflow_type == "Multi-Step Workflow":
        execute_multi_step_workflow(agent, group_id, limit_members, sheet_title)
    elif workflow_type == "Fetch Only":
        execute_fetch_only_workflow(agent, group_id, limit_members)

