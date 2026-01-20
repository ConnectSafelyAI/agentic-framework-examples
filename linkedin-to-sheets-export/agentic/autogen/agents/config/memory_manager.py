"""Memory Manager - Handles search results and context persistence."""

import re
from typing import List, Dict, Any, Optional


class MemoryManager:
    """Manages search results and conversation context."""

    def __init__(self):
        self.last_search_results: List[Dict[str, Any]] = []
        self.last_search_params: Dict[str, Any] = {}
        self.export_history: List[Dict[str, Any]] = []

    def store_search_results(self, results: List[Dict[str, Any]], params: Dict[str, Any]):
        """Store the last search results and parameters."""
        self.last_search_results = results
        self.last_search_params = params

    def get_search_results(self) -> List[Dict[str, Any]]:
        """Get the stored search results."""
        return self.last_search_results

    def record_export(self, export_type: str, details: Dict[str, Any]):
        """Record an export action."""
        self.export_history.append({
            "type": export_type,
            "details": details
        })

    def build_memory_context(self, command: str) -> str:
        """
        Build context string from memory for the current command.

        Args:
            command: The current user command

        Returns:
            Context string to include in the prompt
        """
        context_parts = []

        if self.last_search_results:
            count = len(self.last_search_results)
            params = self.last_search_params
            context_parts.append(
                f"[MEMORY] Last search: {count} profiles found. "
                f"Search params: keywords='{params.get('keywords', 'N/A')}', "
                f"location='{params.get('location', 'N/A')}', "
                f"title='{params.get('title', 'N/A')}'"
            )

        if self.export_history:
            last_export = self.export_history[-1]
            context_parts.append(
                f"[MEMORY] Last export: {last_export['type']} - "
                f"{last_export['details'].get('records_exported', 'N/A')} records"
            )

        return "\n".join(context_parts)

    def should_reset_memory(self, command: str) -> bool:
        """Check if memory should be reset based on command."""
        reset_keywords = ["new search", "start over", "reset", "clear"]
        command_lower = command.lower()
        return any(keyword in command_lower for keyword in reset_keywords)

    def reset_memory(self):
        """Clear all stored memory."""
        self.last_search_results = []
        self.last_search_params = {}
        self.export_history = []

    def extract_search_results(self, response_text: str):
        """
        Extract search results from response if present.
        This is called after each agent response to keep memory updated.
        """
        # Look for success indicators in response
        if "profiles found" in response_text.lower() or "people found" in response_text.lower():
            # Try to extract count
            match = re.search(r'(\d+)\s*(?:profiles?|people)', response_text, re.IGNORECASE)
            if match:
                count = int(match.group(1))
                # Note: Actual results are stored by the agent through direct tool calls
