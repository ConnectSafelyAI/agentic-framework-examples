import os
import requests
from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class SearchGeoLocationInput(BaseModel):
    """Input schema for SearchGeoLocation tool."""
    keywords: str = Field(..., description="Location keywords (e.g., 'Australia', 'New York')")


class SearchGeoLocationTool(BaseTool):
    name: str = "Search Geographic Location"
    description: str = (
        "Search for geographic locations to get location IDs for job searches. "
        "Use this tool to convert location names to location IDs that can be used in job searches."
    )
    args_schema: Type[BaseModel] = SearchGeoLocationInput

    def _run(self, keywords: str) -> dict[str, Any]:
        """Execute the tool to search for geographic locations."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        try:
            response = requests.post(
                "https://api.connectsafely.ai/linkedin/search/geo",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={"keywords": keywords},
                timeout=30,
            )

            if not response.ok:
                return {
                    "success": False,
                    "error": f"ConnectSafely API error: {response.status_code} - {response.text}",
                }

            data = response.json()
            return {
                "success": True,
                "locations": data.get("locations", []),
            }

        except Exception as e:
            return {"success": False, "error": f"Error searching locations: {str(e)}"}