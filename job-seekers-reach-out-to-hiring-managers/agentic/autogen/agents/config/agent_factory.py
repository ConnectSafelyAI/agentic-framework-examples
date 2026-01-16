"""Factory for creating AutoGen AssistantAgent with Gemini model."""
from typing import List, Callable

from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo


def get_system_prompt() -> str:
    """Returns the system prompt for the LinkedIn assistant."""
    return """You are an Autonomous LinkedIn Outreach Agent.

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


def create_assistant_agent(
    api_key: str,
    model: str,
    tools: List[Callable]
) -> AssistantAgent:
    """Creates and returns an AssistantAgent configured for LinkedIn tasks."""
    model_client = OpenAIChatCompletionClient(
        model=model,
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family="gemini",
            structured_output=False,
        ),
    )
    
    return AssistantAgent(
        name="linkedin_assistant",
        model_client=model_client,
        tools=tools,
        system_message=get_system_prompt(),
    )
