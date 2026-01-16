"""
LinkedIn Assistant - Main orchestration class.
Lists ALL jobs (no summarization).
Detailed Connection Success (Message + URL).
Auto-Connects to the BEST manager.
"""
import os
import asyncio
from typing import Optional

from tools import (
    search_geo_location,
    search_jobs,
    get_company_details,
    search_hiring_managers,
    fetch_profile_details,
    check_connection_status,
    send_connection_request
)

from .config.agent_factory import create_assistant_agent
from .config.response_processor import clean_response
from .config.memory_manager import MemoryManager
from .config.execution_utils import is_raw_output, get_continuation_instruction


class LinkedInAssistant:
    """Main LinkedIn assistant using AutoGen."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-pro"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found.")
        
        self.model = model
        self.tools = [
            search_geo_location,
            search_jobs,
            get_company_details,
            search_hiring_managers,
            fetch_profile_details,
            check_connection_status,
            send_connection_request
        ]
        
        self.memory = MemoryManager()
        self.assistant = create_assistant_agent(self.api_key, self.model, self.tools)
        self.conversation_history = []
        print(f"✅ LinkedInAssistant initialized with {model}")
    
    async def execute_async(self, command: str, context: Optional[str] = None) -> str:
        """Execute command asynchronously with context management."""
        if self.memory.should_reset_memory(command):
            self.memory.reset_memory()

        memory_context = self.memory.build_memory_context(command)
        full_prompt = f"{context or ''}\n{memory_context}\nUSER REQUEST: {command}"
        
        max_turns = 8
        current_turn = 0
        
        while current_turn < max_turns:
            try:
                result = await self.assistant.run(task=full_prompt)
                response_text = clean_response(result)
                self.memory.extract_job_results(response_text)

                if is_raw_output(response_text):
                    instruction = get_continuation_instruction(response_text)
                    full_prompt = f"TOOL OUTPUT: {response_text}\n\nNEXT STEP: {instruction}"
                    current_turn += 1
                    continue
                
                self.conversation_history.append({"role": "user", "content": command})
                self.conversation_history.append({"role": "assistant", "content": response_text})
                return response_text
                
            except Exception as e:
                return f"❌ Error: {str(e)}"
        
        return "⚠️ Stopped after max turns."

    def execute_command(self, command: str, context: Optional[str] = None) -> str:
        """Execute command synchronously."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return loop.create_task(self.execute_async(command, context))
            else:
                return loop.run_until_complete(self.execute_async(command, context))
        except RuntimeError:
            return asyncio.run(self.execute_async(command, context))
