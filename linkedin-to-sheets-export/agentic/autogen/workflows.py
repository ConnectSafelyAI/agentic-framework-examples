"""Workflows - Command execution handler for LinkedIn Export."""

from typing import Dict, Any, Optional
from autogen_client import LinkedInExportClient


class LinkedInExportWorkflows:
    """Workflow handler for LinkedIn search and export operations."""

    def __init__(self):
        self.client = LinkedInExportClient()

    def execute_command(self, command: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a workflow command.

        Args:
            command: Natural language command
            context: Optional conversation context

        Returns:
            Dict with execution result
        """
        return self.client.execute(command, context)

    def search_and_export(
        self,
        keywords: str,
        location: str = None,
        title: str = None,
        limit: int = 100,
        export_type: str = "sheets"
    ) -> Dict[str, Any]:
        """
        Convenience method to search and export in one call.

        Args:
            keywords: Search keywords
            location: Optional location filter
            title: Optional title filter
            limit: Max results (default: 100)
            export_type: "sheets", "json", or "both"

        Returns:
            Dict with search and export results
        """
        # Build search command
        search_cmd = f"Search for {limit} LinkedIn profiles with keywords '{keywords}'"
        if location:
            search_cmd += f" in {location}"
        if title:
            search_cmd += f" with title '{title}'"

        search_result = self.client.execute(search_cmd)

        # Build export command
        if export_type == "both":
            export_cmd = "Export the results to both Google Sheets and JSON"
        elif export_type == "json":
            export_cmd = "Export the results to a JSON file"
        else:
            export_cmd = "Export the results to Google Sheets"

        export_result = self.client.execute(
            export_cmd,
            context=str(search_result.get("result", ""))
        )

        return {
            "search_result": search_result,
            "export_result": export_result
        }
