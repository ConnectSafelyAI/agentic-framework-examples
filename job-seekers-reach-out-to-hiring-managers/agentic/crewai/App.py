import os

# Disable CrewAI telemetry
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"

import streamlit as st
from dotenv import load_dotenv
from crew import JobSearchCrew

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
        page_title="Job Search Agent", 
        page_icon="💼", 
        layout="wide"
    )
    st.title("💼 Job Search → Hiring Manager Outreach Agent")
    st.markdown("**Powered by CrewAI & ConnectSafely.ai**")

    if not check_env():
        st.stop()
    
    # Initialize session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "context" not in st.session_state:
        st.session_state.context = ""
    
    # Display chat history
    st.subheader("💬 Command Interface")
    
    # Show example commands
    with st.expander("💡 Example Commands"):
        st.markdown("""
        **Start simple:**
        1. `Find 1 software engineering job in India`
        2. `Find hiring managers for this job`
        3. `Connect with [manager name]`
        
        **Tips:**
        - Start with 1-2 jobs for faster results
        - Be specific in your commands
        - Use simple, direct language
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
        st.header("⚙️ Controls")
        if st.button("🗑️ Clear History"):
            st.session_state.messages = []
            st.session_state.context = ""
            st.rerun()
        
        st.divider()
        st.subheader("📋 Context Size")
        context_size = len(st.session_state.context)
        st.metric("Characters", context_size)
        if context_size > 1500:
            st.warning("Context is large. Consider clearing for better performance.")
    
    # Process command
    if command:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": command})
        
        # Show user message immediately
        st.chat_message("user").write(command)
        
        with st.chat_message("assistant"):
            with st.spinner("🤖 Agent working..."):
                try:
                    crew = JobSearchCrew()
                    
                    # Execute with context
                    result = crew.execute(
                        command=command,
                        context=st.session_state.context if st.session_state.context else None
                    )
                    
                    # Update context with result (keep it manageable)
                    result_str = str(result.get("result", ""))
                    
                    # Keep only last 1500 chars of context
                    if len(st.session_state.context) > 1500:
                        st.session_state.context = st.session_state.context[-1500:]
                    
                    # Append new result
                    st.session_state.context += f"\n\n{command}: {result_str}\n"
                    
                    # Display result
                    st.write(result_str)
                    
                    # Add assistant response
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": result_str
                    })
                    
                except Exception as e:
                    error_msg = f"❌ Error: {str(e)}"
                    st.error(error_msg)
                    st.info("💡 Try: 1) Clearing history 2) Using simpler command 3) Starting with 1 job")
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": error_msg
                    })


if __name__ == "__main__":
    main()
