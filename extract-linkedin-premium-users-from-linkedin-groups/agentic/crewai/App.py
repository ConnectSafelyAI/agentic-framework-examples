import os

# Disable CrewAI telemetry
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"

import streamlit as st
from dotenv import load_dotenv
from crew import LinkedInCrew

load_dotenv()


def check_env():
    """Verify required environment variables."""
    required = ["CONNECTSAFELY_API_TOKEN", "GEMINI_API_KEY"]
    missing = [v for v in required if not os.getenv(v)]
    if missing:
        st.error(f"❌ Missing: {', '.join(missing)}")
        return False
    
    if not os.getenv("GOOGLE_CLIENT_ID"):
        st.warning("⚠️ Google Sheets credentials missing. Export will fail.")
    return True


def main():
    st.set_page_config(page_title="LinkedIn Extractor", page_icon="🔗", layout="wide")
    st.title("🔗 LinkedIn Premium Member Extractor")
    st.markdown("**Powered by CrewAI & ConnectSafely.ai**")

    if not check_env():
        st.stop()

    with st.sidebar:
        st.header("⚙️ Configuration")
        mode = st.radio("Mode", ["Complete Workflow", "Multi-Step Workflow", "Fetch Only"])
        group_id = st.text_input("Group ID", placeholder="e.g., 9357376")
        
        limit = st.checkbox("Limit members", value=True)
        max_members = st.number_input("Max", 1, 10000, 100) if limit else None
        
        export = st.checkbox("Export to Sheets", value=True, disabled=mode == "Fetch Only")
        title = st.text_input("Sheet Title") if export else None

    if st.button("▶️ Start Extraction", type="primary"):
        if not group_id:
            st.warning("⚠️ Please enter a Group ID")
            st.stop()

        with st.spinner("🤖 Agents working..."):
            try:
                crew = LinkedInCrew()
                kwargs = {
                    "group_id": group_id,
                    "max_members": max_members,
                }
                
                if mode == "Complete Workflow":
                    res = crew.complete_workflow(**kwargs, spreadsheet_title=title, export_to_sheets=export)
                elif mode == "Multi-Step Workflow":
                    res = crew.multi_step_workflow(**kwargs, spreadsheet_title=title)
                else:
                    res = crew.fetch_only(**kwargs)

                st.success("✅ Workflow completed!")
                
                with st.expander("🤖 Agent Output", expanded=True):
                    st.code(str(res.get("result", "")), language="text")
                
                if res.get("sheets_exported"):
                    st.info("📊 Spreadsheet Created! Check output above for URL.")

            except Exception as e:
                st.error(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
