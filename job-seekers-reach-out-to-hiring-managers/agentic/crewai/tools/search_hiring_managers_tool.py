import os
import requests
from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class SearchHiringManagersInput(BaseModel):
    """Input schema for SearchHiringManagers tool."""
    companyId: str = Field(..., description="Numeric company ID (not universal name)")
    jobTitle: Optional[str] = Field(None, description="Job title to help determine appropriate manager titles")
    managerTitle: Optional[str] = Field(None, description="Custom manager title keywords (e.g., 'Engineering Manager OR VP Engineering')")
    count: Optional[int] = Field(5, description="Number of people to return (max 25)")
    connectionDegree: Optional[list[str]] = Field(["S", "O"], description="Connection degree filter: S=2nd degree, O=3rd+ degree")


class SearchHiringManagersTool(BaseTool):
    name: str = "Search Hiring Managers"
    description: str = (
        "Search for hiring managers or recruiters at a specific company. "
        "Automatically determines appropriate manager titles based on job title if not provided. "
        "Use this tool to find decision-makers at target companies."
    )
    args_schema: Type[BaseModel] = SearchHiringManagersInput

    def _run(
        self,
        companyId: str,
        jobTitle: Optional[str] = None,
        managerTitle: Optional[str] = None,
        count: Optional[int] = 5,
        connectionDegree: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """Execute the tool to search for hiring managers."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        # Determine manager title based on job title if not provided
        search_title = managerTitle or "Hiring Manager OR Recruiter"
        if jobTitle and not managerTitle:
            lower_title = jobTitle.lower()
            if "engineer" in lower_title:
                search_title = "Engineering Manager OR VP Engineering OR CTO"
            elif "sales" in lower_title:
                search_title = "Sales Director OR VP Sales"
            elif "marketing" in lower_title:
                search_title = "Marketing Director OR CMO"

        try:
            response = requests.post(
                "https://api.connectsafely.ai/linkedin/search/people",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "keywords": search_title,
                    "count": min(count, 25),
                    "filters": {
                        "currentCompanyIds": [companyId],
                        "connectionDegree": connectionDegree or ["S", "O"],
                    },
                },
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
                "people": data.get("people", []),
            }

        except Exception as e:
            return {"success": False, "error": f"Error searching hiring managers: {str(e)}"}