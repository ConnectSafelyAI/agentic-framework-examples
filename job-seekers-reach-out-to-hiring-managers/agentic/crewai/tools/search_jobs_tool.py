import os
import requests
from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class SearchJobsInput(BaseModel):
    """Input schema for SearchJobs tool."""
    keywords: str = Field(..., description="Job search keywords (e.g., 'Software Engineer')")
    count: Optional[int] = Field(5, description="Number of jobs to return (max 25)")
    start: Optional[int] = Field(0, description="Pagination offset")
    locationId: Optional[str] = Field(None, description="Geographic location ID from search-geo-location")
    datePosted: Optional[str] = Field("past-week", description="Date filter: 'past-24-hours', 'past-week', 'past-month'")


class SearchJobsTool(BaseTool):
    name: str = "Search LinkedIn Jobs"
    description: str = (
        "Search for LinkedIn jobs by keywords and location. "
        "Use this tool to find relevant job postings based on job title keywords and location."
    )
    args_schema: Type[BaseModel] = SearchJobsInput

    def _run(
        self,
        keywords: str,
        count: Optional[int] = 5,
        start: Optional[int] = 0,
        locationId: Optional[str] = None,
        datePosted: Optional[str] = "past-week",
    ) -> dict[str, Any]:
        """Execute the tool to search for LinkedIn jobs."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        try:
            payload = {
                "keywords": keywords,
                "count": min(count, 25),
                "start": start,
                "filters": {
                    "datePosted": datePosted,
                },
            }
            if locationId:
                payload["filters"]["locationId"] = locationId

            response = requests.post(
                "https://api.connectsafely.ai/linkedin/search/jobs",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json=payload,
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
                "jobs": data.get("jobs", []),
                "total": data.get("total"),
            }

        except Exception as e:
            return {"success": False, "error": f"Error searching jobs: {str(e)}"}