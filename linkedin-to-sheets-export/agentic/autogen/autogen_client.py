"""AutoGen Client - Wrapper for the LinkedInExportAssistant."""

import asyncio
from typing import Dict, Any, Optional
from agents import LinkedInExportAssistant


class LinkedInExportClient:
    """Client wrapper providing a simple execute() interface."""

    def __init__(self):
        self.assistant = LinkedInExportAssistant()

    def execute(self, command: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a command and return the result.

        Args:
            command: User command to execute
            context: Optional context from previous interactions

        Returns:
            Dict with 'result' key containing the response
        """
        try:
            # Handle async execution
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If we're in an existing event loop (e.g., Streamlit)
                    import nest_asyncio
                    nest_asyncio.apply()
                    result = loop.run_until_complete(
                        self.assistant.execute_async(command, context)
                    )
                else:
                    result = loop.run_until_complete(
                        self.assistant.execute_async(command, context)
                    )
            except RuntimeError:
                result = asyncio.run(self.assistant.execute_async(command, context))

            return {"result": result}

        except Exception as e:
            return {"result": f"Error: {str(e)}"}


# Alias for backwards compatibility
JobSearchClient = LinkedInExportClient
