import os
import streamlit as st
from dotenv import load_dotenv
from autogen_client import JobSearchClient

# Disable AutoGen telemetry if available
os.environ.setdefault("AUTOGEN_TELEMETRY_OPT_OUT", "true")

load_dotenv()

def check_env():
    """Verify required environment variables."""
    required = ["CONNECTSAFELY_API_TOKEN", "GEMINI_API_KEY"]
    missing = [v for v in required if not os.getenv(v)]
    if missing:
        st.error(f"❌ Missing: {', '.join(missing)}")
        return False
    return True

def main():
    st.set_page_config(
        page_title="Job Search Agent (AutoGen)", 
        page_icon="💼", 
        layout="wide"
    )
    st.title("💼 Job Search → Hiring Manager Outreach Agent")
    st.markdown("**Powered by AutoGen & ConnectSafely.ai**")

    if not check_env():
        st.stop()
    
    # --- 1. INITIALIZE SESSION STATE ---
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "context" not in st.session_state:
        st.session_state.context = ""
    
    # ✅ FIX: Initialize the Agent ONCE and persist it
    # This keeps the 'last_search_results' memory alive across clicks
    if "agent_client" not in st.session_state:
        with st.spinner("Initializing Agent..."):
            st.session_state.agent_client = JobSearchClient()
            # Optional: Print to console so you know it started
            print("✅ Agent initialized in Session State")
    
    # Display chat history
    st.subheader("💬 Command Interface")
    
    # Show example commands
    with st.expander("💡 Example Workflow"):
        st.markdown("""
        **Try this sequence:**
        1. `Find software engineering jobs in Australia`
        2. `Find hiring manager for Job ID [ID]` (Copy ID from results)
        3. `Connect with [Manager Name]`
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
        st.header("⚙️ Controls")
        if st.button("🗑️ Clear History & Reset Agent"):
            st.session_state.messages = []
            st.session_state.context = ""
            # Re-initialize to wipe memory clean
            st.session_state.agent_client = JobSearchClient()
            st.rerun()
        
        st.divider()
        st.subheader("📋 Context Size")
        # Just a visual indicator
        st.metric("Context Length", len(st.session_state.context))
    
    # --- 2. PROCESS COMMAND ---
    if command:
        # Display User Message
        st.session_state.messages.append({"role": "user", "content": command})
        st.chat_message("user").write(command)
        
        with st.chat_message("assistant"):
            with st.spinner("🤖 Agent working..."):
                try:
                    # ✅ FIX: Use the PERSISTENT client
                    client = st.session_state.agent_client
                    
                    # Execute
                    # Note: We still pass context string for LLM awareness, 
                    # but the client object now retains its internal list memory too.
                    result = client.execute(
                        command=command,
                        context=st.session_state.context if st.session_state.context else None
                    )
                    
                    result_str = str(result.get("result", ""))
                    
                    # Update textual context (keep last 2000 chars)
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
                    error_msg = f"❌ Error: {str(e)}"
                    st.error(error_msg)
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": error_msg
                    })

if __name__ == "__main__":
    main()