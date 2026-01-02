"""
Streamlit UI for LinkedIn Premium Member Extractor
CrewAI + ConnectSafely.ai Implementation
"""

import os

# Disable CrewAI telemetry to avoid signal handler issues in Streamlit
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"

import streamlit as st
from dotenv import load_dotenv
from crew import LinkedInCrew

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="LinkedIn Premium Extractor",
    page_icon="🔗",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #0077B5;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .success-box {
        padding: 1rem;
        background-color: #d4edda;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
    }
    .error-box {
        padding: 1rem;
        background-color: #f8d7da;
        border-left: 4px solid #dc3545;
        margin: 1rem 0;
    }
    .info-box {
        padding: 1rem;
        background-color: #d1ecf1;
        border-left: 4px solid #0077B5;
        margin: 1rem 0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


def check_environment():
    """Check if required environment variables are set."""
    required_vars = ["CONNECTSAFELY_API_TOKEN", "GEMINI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        st.error(
            f"❌ Missing required environment variables: {', '.join(missing_vars)}\n\n"
            "Please set these in your .env file. See .env.example for reference."
        )
        return False

    optional_vars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"]
    missing_optional = [var for var in optional_vars if not os.getenv(var)]

    if missing_optional:
        st.warning(
            f"⚠️ Missing optional environment variables: {', '.join(missing_optional)}\n\n"
            "Google Sheets export will not work without these credentials."
        )

    return True


def main():
    """Main Streamlit application."""

    # Header
    st.markdown('<p class="main-header">🔗 LinkedIn Premium Member Extractor</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="sub-header">Powered by CrewAI & ConnectSafely.ai</p>',
        unsafe_allow_html=True,
    )

    # Check environment
    if not check_environment():
        st.stop()

    # Sidebar - Configuration
    with st.sidebar:
        st.header("⚙️ Configuration")

        # Workflow mode selection
        workflow_mode = st.radio(
            "Workflow Mode",
            options=["Complete Workflow", "Multi-Step Workflow", "Fetch Only"],
            help=(
                "• Complete: Fast single-agent workflow\n"
                "• Multi-Step: Detailed multi-agent workflow\n"
                "• Fetch Only: Just fetch members, no filtering"
            ),
        )

        st.divider()

        # LinkedIn Group Configuration
        st.subheader("LinkedIn Group")
        group_id = st.text_input(
            "Group ID",
            placeholder="e.g., 9357376",
            help="Enter the LinkedIn group ID to extract members from",
        )

        max_members = st.number_input(
            "Max Members (Optional)",
            min_value=1,
            max_value=10000,
            value=100,
            step=10,
            help="Maximum number of members to fetch. Leave as default to fetch all.",
        )

        use_max_members = st.checkbox("Limit max members", value=True)

        st.divider()

        # Google Sheets Configuration
        st.subheader("Google Sheets Export")

        export_to_sheets = st.checkbox(
            "Export to Google Sheets",
            value=True,
            disabled=(workflow_mode == "Fetch Only"),
        )

        spreadsheet_title = st.text_input(
            "Spreadsheet Title (Optional)",
            placeholder="e.g., Premium Leads Q1 2024",
            help="Custom title for the spreadsheet. Auto-generated if left empty.",
            disabled=not export_to_sheets,
        )

        st.divider()

        # Info
        st.info(
            "💡 **Tips:**\n"
            "- Complete Workflow is fastest\n"
            "- Multi-Step shows detailed progress\n"
            "- Check logs in terminal for details"
        )

    # Main content area
    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("📋 Workflow Details")

        if workflow_mode == "Complete Workflow":
            st.markdown(
                """
                **Complete Workflow** (Recommended)
                - ✅ Fetch members from LinkedIn group
                - ✅ Automatically filter for Premium/Verified
                - ✅ Export to Google Sheets (optional)
                - ⚡ Fast single-agent execution
                """
            )
        elif workflow_mode == "Multi-Step Workflow":
            st.markdown(
                """
                **Multi-Step Workflow** (Detailed)
                - 👤 Agent 1: Fetch members (LinkedIn Researcher)
                - 🔍 Agent 2: Filter premium profiles (Data Analyst)
                - 📊 Agent 3: Export to Google Sheets (Spreadsheet Manager)
                - 📝 Detailed step-by-step progress
                """
            )
        else:
            st.markdown(
                """
                **Fetch Only** (No Filtering)
                - 📥 Fetch all members from LinkedIn group
                - ❌ No premium filtering
                - ❌ No Google Sheets export
                - 🎯 Raw member data only
                """
            )

    with col2:
        st.subheader("🔗 Resources")
        st.markdown(
            """
            - [ConnectSafely.ai Docs](https://connectsafely.ai/docs)
            - [Get API Token](https://connectsafely.ai/dashboard)
            - [Support](mailto:support@connectsafely.ai)
            """
        )

    st.divider()

    # Execution section
    st.subheader("🚀 Execute Workflow")

    # Validation
    if not group_id:
        st.warning("⚠️ Please enter a LinkedIn Group ID to continue.")
        st.stop()

    # Execute button
    execute_button = st.button(
        "▶️ Start Extraction",
        type="primary",
        use_container_width=True,
    )

    if execute_button:
        # Show progress
        with st.spinner("🤖 CrewAI agents are working..."):
            try:
                # Initialize crew
                crew = LinkedInCrew()

                # Prepare parameters
                max_members_value = max_members if use_max_members else None
                spreadsheet_title_value = spreadsheet_title if spreadsheet_title else None

                # Execute based on workflow mode
                if workflow_mode == "Complete Workflow":
                    result = crew.complete_workflow(
                        group_id=group_id,
                        max_members=max_members_value,
                        spreadsheet_title=spreadsheet_title_value,
                        export_to_sheets=export_to_sheets,
                    )
                elif workflow_mode == "Multi-Step Workflow":
                    result = crew.multi_step_workflow(
                        group_id=group_id,
                        max_members=max_members_value,
                        spreadsheet_title=spreadsheet_title_value,
                    )
                else:  # Fetch Only
                    result = crew.fetch_only(
                        group_id=group_id,
                        max_members=max_members_value,
                    )

                # Display success
                st.success("✅ Workflow completed successfully!")

                # Display results
                st.subheader("📊 Results")

                # Show the CrewAI output
                with st.expander("🤖 Agent Output", expanded=True):
                    st.code(str(result.get("result", "No output")), language="text")

                # Additional info
                if result.get("sheets_exported"):
                    st.info(
                        "📊 **Spreadsheet Created!**\n\n"
                        "Check the agent output above for the Google Sheets URL."
                    )

                # Download option (if applicable)
                if workflow_mode != "Fetch Only":
                    st.download_button(
                        label="📥 Download Results as Text",
                        data=str(result.get("result", "")),
                        file_name=f"linkedin_extraction_{group_id}.txt",
                        mime="text/plain",
                    )

            except Exception as e:
                st.error(f"❌ Error during execution: {str(e)}")
                st.exception(e)

    # Footer
    st.divider()
    st.markdown(
        """
        <div style='text-align: center; color: #666; padding: 2rem 0;'>
            <p>Built with CrewAI, ConnectSafely.ai, and Streamlit</p>
            <p>
                <a href="https://connectsafely.ai" target="_blank">Website</a> •
                <a href="https://connectsafely.ai/docs" target="_blank">Docs</a> •
                <a href="mailto:support@connectsafely.ai">Support</a>
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
