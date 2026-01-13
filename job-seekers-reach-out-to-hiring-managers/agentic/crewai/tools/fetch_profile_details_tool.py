import os
import requests
from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class FetchProfileDetailsInput(BaseModel):
    """Input schema for FetchProfileDetails tool."""
    profileId: str = Field(..., description="Profile ID (vanity name from publicIdentifier or profileUrl)")


class FetchProfileDetailsTool(BaseTool):
    name: str = "Fetch Profile Details"
    description: str = (
        "Fetch detailed profile information for a LinkedIn user by profile ID (vanity name). "
        "Use this tool to get comprehensive profile information including experience, summary, "
        "and other details to help personalize connection messages."
    )
    args_schema: Type[BaseModel] = FetchProfileDetailsInput

    def _run(self, profileId: str) -> dict[str, Any]:
        """Execute the tool to fetch profile details."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        try:
            response = requests.post(
                "https://api.connectsafely.ai/linkedin/profile",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={"profileId": profileId},
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
                "profile": data.get("profile", {}),
            }

        except Exception as e:
            return {"success": False, "error": f"Error fetching profile details: {str(e)}"}