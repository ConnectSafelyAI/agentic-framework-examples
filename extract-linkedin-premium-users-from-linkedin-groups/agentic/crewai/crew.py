"""
Main Crew Configuration for LinkedIn Premium Member Extraction
"""

from workflows import LinkedInWorkflows


class LinkedInCrew:
    """Facade for LinkedIn workflows."""

    def __init__(self):
        self.workflows = LinkedInWorkflows()

    def complete_workflow(self, **kwargs) -> dict:
        result = self.workflows.run_complete(**kwargs)
        return {
            "success": True,
            "result": result,
            "sheets_exported": kwargs.get("export_to_sheets", True),
        }

    def fetch_only(self, **kwargs) -> dict:
        result = self.workflows.run_fetch_only(**kwargs)
        return {"success": True, "result": result}

    def multi_step_workflow(self, **kwargs) -> dict:
        result = self.workflows.run_multi_step(**kwargs)
        return {"success": True, "result": result, "sheets_exported": True}
