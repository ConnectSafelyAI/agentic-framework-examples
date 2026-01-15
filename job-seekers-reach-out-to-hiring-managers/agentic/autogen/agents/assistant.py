"""
LinkedIn Assistant - FINAL PERFECTED VERSION
- Lists ALL jobs (no summarization).
- detailed Connection Success (Message + URL).
- Auto-Connects to the BEST manager.
"""
import os
import asyncio
import json
import ast
from typing import Optional, Any, List, Dict

from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo

from tools import (
    search_geo_location,
    search_jobs,
    get_company_details,
    search_hiring_managers,
    fetch_profile_details,
    check_connection_status,
    send_connection_request
)

class LinkedInAssistant:
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
        
        self.last_search_results: List[Dict] = [] 
        self.assistant = self._create_assistant()
        self.conversation_history = []
        print(f"✅ LinkedInAssistant initialized with {model}")
    
    def _create_assistant(self) -> AssistantAgent:
        model_client = OpenAIChatCompletionClient(
            model=self.model,
            api_key=self.api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            model_info=ModelInfo(
                vision=False,
                function_calling=True,
                json_output=False,
                family="gemini",
                structured_output=False,
            ),
        )
        
        # 🔥 SYSTEM PROMPT: Enforcing List Completeness & Auto-Actions
        system_message = """You are an Autonomous LinkedIn Outreach Agent.

### 🧠 INTELLIGENT RULES
1. **JOB LISTING:** If the user asks for N jobs, **LIST ALL N JOBS**. Do not summarize "Top 3". Show the full table/list with Job IDs.
2. **MANAGER SEARCH:** Always call `search_hiring_managers` with `count=10` to see all options.
3. **ONE-SHOT CONNECT:** If the user says "Connect":
   - **Step A:** Find managers.
   - **Step B:** **AUTO-SELECT** the SINGLE best match (e.g. 'Engineering Manager' for 'Software Engineer').
   - **Step C:** Send the connection request IMMEDIATELY.

4. **MEMORY:** Check 'HIDDEN DATA' for `companyId` when Job ID is mentioned.

### 📋 OUTPUT FORMATTING
- **Jobs:** Title | Company | Location | **Job ID** (Bold the ID)
- **Connection Success:** Show the Profile Name, The Message Sent, and the Profile URL.
"""
        return AssistantAgent(
            name="linkedin_assistant",
            model_client=model_client,
            tools=self.tools,
            system_message=system_message,
        )
    
    async def execute_async(self, command: str, context: Optional[str] = None) -> str:
        # INTELLIGENT RESET: Clear memory on fresh searches
        lower_cmd = command.lower()
        if "find" in lower_cmd and "job" in lower_cmd and "id" not in lower_cmd:
            self.last_search_results = []

        # 1. Inject Memory Context
        memory_context = ""
        if self.last_search_results:
            for job in self.last_search_results:
                if str(job.get('jobId')) in command:
                    memory_context += f"\n💡 DATA FOUND for Job ID {job.get('jobId')}:\n"
                    memory_context += f"   - Company: {job.get('companyName')}\n"
                    memory_context += f"   - Company ID: {job.get('companyId')} <--- REQUIRED\n"
                    memory_context += f"   - Job Title: {job.get('title')}\n"

        full_prompt = f"{context or ''}\n{memory_context}\nUSER REQUEST: {command}"
        
        # 2. Run Auto-Loop
        max_turns = 8 
        current_turn = 0
        
        while current_turn < max_turns:
            try:
                result = await self.assistant.run(task=full_prompt)
                response_text = self._clean_response(result)
                
                # Capture Job Results
                if '"jobs": [{' in response_text or "'jobs': [{" in response_text:
                     try:
                         start = response_text.find("[{")
                         end = response_text.rfind("}]") + 2
                         if start != -1:
                             self.last_search_results = ast.literal_eval(response_text[start:end])
                     except: pass

                # Check for intermediate tool output
                is_raw_output = (
                    "{'success': True" in response_text or 
                    "'location_id':" in response_text or 
                    "'jobId':" in response_text or
                    "'people': [" in response_text
                )
                
                if is_raw_output:
                    instruction = "Continue logic."
                    if "'people': [" in response_text:
                         instruction = "I have the list. If user said CONNECT, pick the best one and send request. If user said FIND, list ALL of them."
                    
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
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running(): return loop.create_task(self.execute_async(command, context))
            else: return loop.run_until_complete(self.execute_async(command, context))
        except RuntimeError: return asyncio.run(self.execute_async(command, context))

    def _clean_response(self, result: Any) -> str:
        text_response = ""
        if hasattr(result, 'messages'):
            for msg in reversed(result.messages):
                if hasattr(msg, 'content') and msg.source != 'user':
                    if isinstance(msg.content, str):
                        text_response = msg.content
                        break
                    elif isinstance(msg.content, list):
                        parts = [p if isinstance(p, str) else p.get('text', '') for p in msg.content if isinstance(p, (str, dict))]
                        text_response = "\n".join(parts)
                        break
        
        text_response = text_response or str(result)
        cleaned = text_response.strip()

        if cleaned.startswith("{") or cleaned.startswith("["):
            try:
                data = ast.literal_eval(cleaned)
                if isinstance(data, dict):
                    # ✅ DETAILED SUCCESS MESSAGE (Message + URL)
                    if 'status' in data and 'sent' in str(data.get('status')):
                        profile_id = data.get('profileId', 'Unknown')
                        msg_sent = data.get('customMessage', 'No custom message.')
                        url = f"https://www.linkedin.com/in/{profile_id}"
                        
                        return (
                            f"✅ **Connection request sent successfully to {profile_id}**\n\n"
                            f"📝 **Invitation Message:**\n_{msg_sent}_\n\n"
                            f"🔗 **Profile URL:**\n[{url}]({url})"
                        )
                    
                    if 'people' in data:
                        count = len(data['people'])
                        out = f"👤 **Found {count} Hiring Managers:**\n"
                        for p in data['people']:
                            p_url = p.get('profileUrl') or f"https://www.linkedin.com/in/{p.get('profileId')}"
                            out += f"- **{p.get('name')}** ({p.get('headline')})\n  ID: `{p.get('profileId')}` | [View Profile]({p_url})\n"
                        return out
            except: pass
            
        return text_response