import os
import streamlit as st
from dotenv import load_dotenv
from autogen_client import LinkedInExportClient

# Disable AutoGen telemetry if available
os.environ.setdefault("AUTOGEN_TELEMETRY_OPT_OUT", "true")

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
        page_title="LinkedIn to Sheets Export (AutoGen)",
        page_icon="📊",
        layout="wide"
    )
    st.title("📊 LinkedIn Search → Google Sheets Export")
    st.markdown("**Powered by AutoGen & ConnectSafely.ai**")

    if not check_env():
        st.stop()

    # Initialize session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "context" not in st.session_state:
        st.session_state.context = ""

    # Initialize the Agent ONCE and persist it
    if "agent_client" not in st.session_state:
        with st.spinner("Initializing Agent..."):
            st.session_state.agent_client = LinkedInExportClient()
            print("Agent initialized in Session State")

    # Display chat history
    st.subheader("Command Interface")

    # Show example commands
    with st.expander("Example Workflow"):
        st.markdown("""
        **Try this sequence:**
        1. `Search for 50 CEOs in United States with title "Head of Growth"`
        2. `Show me a summary of the results`
        3. `Export the results to Google Sheets`
        4. `Also export to JSON`

        **Other examples:**
        - `Find 100 software engineers in San Francisco`
        - `Search for Marketing Directors in New York`
        - `Export results to both Sheets and JSON`
        """)

    # Chat container
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.messages:
            role = msg["role"]
            content = msg["content"]
            if role == "user":
                st.chat_message("user").write(content)
            else:
                st.chat_message("assistant").write(content)

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

        if st.button("Clear History & Reset"):
            st.session_state.messages = []
            st.session_state.context = ""
            st.session_state.agent_client = LinkedInExportClient()
            st.rerun()

        st.divider()
        st.subheader("Context Size")
        st.metric("Characters", len(st.session_state.context))

        st.divider()
        st.subheader("Setup Status")
        sheets_creds = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
        if sheets_creds and os.path.exists(sheets_creds):
            st.success("Google Sheets: Configured")
        else:
            st.warning("Google Sheets: Not configured")
            st.caption("Set GOOGLE_SHEETS_CREDENTIALS_FILE")

    # Process command
    if command:
        # Display User Message
        st.session_state.messages.append({"role": "user", "content": command})
        st.chat_message("user").write(command)

        with st.chat_message("assistant"):
            with st.spinner("Agent working..."):
                try:
                    client = st.session_state.agent_client

                    result = client.execute(
                        command=command,
                        context=st.session_state.context if st.session_state.context else None
                    )

                    result_str = str(result.get("result", ""))

                    # Update context (keep last 2000 chars)
                    if len(st.session_state.context) > 2000:
                        st.session_state.context = st.session_state.context[-2000:]

                    st.session_state.context += f"\n\nUser: {command}\nAgent: {result_str}\n"

                    # Display Result
                    st.markdown(result_str)

                    # Save to history
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": result_str
                    })

                except Exception as e:
                    error_msg = f"Error: {str(e)}"
                    st.error(error_msg)
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": error_msg
                    })


if __name__ == "__main__":
    main()
