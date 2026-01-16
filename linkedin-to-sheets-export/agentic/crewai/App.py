import os

# Disable CrewAI telemetry
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"

import streamlit as st
from dotenv import load_dotenv
from crew import LinkedInExportCrew

load_dotenv()


def check_env():
    """Verify required environment variables."""
    required = ["CONNECTSAFELY_API_TOKEN", "GEMINI_API_KEY"]
    missing = [v for v in required if not os.getenv(v)]
    if missing:
        st.error(f"Missing environment variables: {', '.join(missing)}")
        return False
    return True


def main():
    st.set_page_config(
        page_title="LinkedIn to Sheets Export (CrewAI)",
        page_icon="📊",
        layout="wide"
    )
    st.title("📊 LinkedIn Search → Google Sheets Export")
    st.markdown("**Powered by CrewAI & ConnectSafely.ai**")

    if not check_env():
        st.stop()

    # Initialize session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "context" not in st.session_state:
        st.session_state.context = ""

    # Display chat history
    st.subheader("Command Interface")

    # Show example commands
    with st.expander("Example Commands"):
        st.markdown("""
        **Start simple:**
        1. `Search for 50 CEOs in United States`
        2. `Export results to Google Sheets`
        3. `Also save as JSON file`

        **Tips:**
        - Start with smaller searches (25-50) for faster results
        - Be specific with keywords and location
        - Export to both formats if needed
        """)

    # Chat container
    chat_container = st.container()

    with chat_container:
        for msg in st.session_state.messages:
            if msg["role"] == "user":
                st.chat_message("user").write(msg["content"])
            else:
                st.chat_message("assistant").write(msg["content"])

    # Command input
    command = st.chat_input("Enter your command...")

    # Sidebar controls
    with st.sidebar:
        st.header("Controls")

        st.subheader("Quick Actions")
        col1, col2 = st.columns(2)

        with col1:
            if st.button("Export to Sheets"):
                command = "Export the search results to Google Sheets"

        with col2:
            if st.button("Export to JSON"):
                command = "Export the search results to a JSON file"

        st.divider()

        if st.button("Clear History"):
            st.session_state.messages = []
            st.session_state.context = ""
            st.rerun()

        st.divider()
        st.subheader("Context Size")
        context_size = len(st.session_state.context)
        st.metric("Characters", context_size)
        if context_size > 1500:
            st.warning("Context is large. Consider clearing for better performance.")

        st.divider()
        st.subheader("Setup Status")
        sheets_creds = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
        if sheets_creds and os.path.exists(sheets_creds):
            st.success("Google Sheets: Configured")
        else:
            st.warning("Google Sheets: Not configured")

    # Process command
    if command:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": command})

        # Show user message immediately
        st.chat_message("user").write(command)

        with st.chat_message("assistant"):
            with st.spinner("Agent working..."):
                try:
                    crew = LinkedInExportCrew()

                    # Execute with context
                    result = crew.execute(
                        command=command,
                        context=st.session_state.context if st.session_state.context else None
                    )

                    result_str = str(result.get("result", ""))

                    # Keep only last 1500 chars of context
                    if len(st.session_state.context) > 1500:
                        st.session_state.context = st.session_state.context[-1500:]

                    st.session_state.context += f"\n\n{command}: {result_str}\n"

                    # Display result
                    st.write(result_str)

                    # Add assistant response
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": result_str
                    })

                except Exception as e:
                    error_msg = f"Error: {str(e)}"
                    st.error(error_msg)
                    st.info("Try: 1) Clearing history 2) Using simpler command")
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": error_msg
                    })


if __name__ == "__main__":
    main()
