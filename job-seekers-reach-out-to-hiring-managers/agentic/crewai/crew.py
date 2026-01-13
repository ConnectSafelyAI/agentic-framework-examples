"""
Main Crew Configuration for Job Search and Hiring Manager Outreach
"""

from workflows import JobSearchWorkflows


class JobSearchCrew:
    """Command-based job search crew."""

    def __init__(self):
        self.workflows = JobSearchWorkflows()

    def execute(self, command: str, context: str | None = None) -> dict:
        """Execute a command with optional context."""
        result = self.workflows.execute_command(command, context)
        return {
            "success": True,
            "result": result,
        }
