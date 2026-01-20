"""CrewAI Crew wrapper for LinkedIn to Sheets Export."""

import os
from typing import Dict, Any, Optional
from crewai import Crew, Task
from agents import create_export_agent


class LinkedInExportCrew:
    """Crew wrapper for LinkedIn search and export operations."""

    def __init__(self):
        self.agent = create_export_agent()

    def execute(self, command: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a command using the LinkedIn Export agent.

        Args:
            command: Natural language command from the user
            context: Optional context from previous interactions

        Returns:
            Dict with 'result' key containing the response
        """
        # Build task description with context if provided
        task_description = command
        if context:
            task_description = f"""Previous context:
{context}

Current request:
{command}"""

        task = Task(
            description=task_description,
            expected_output="""A clear response that:
1. Confirms what action was taken
2. Provides relevant statistics (number of results, exported records, etc.)
3. Includes any relevant URLs or file paths
4. Suggests next steps if applicable""",
            agent=self.agent,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=False,
        )

        try:
            result = crew.kickoff()
            return {"result": str(result)}
        except Exception as e:
            return {"result": f"Error: {str(e)}"}


# Alias for backwards compatibility
JobSearchCrew = LinkedInExportCrew
