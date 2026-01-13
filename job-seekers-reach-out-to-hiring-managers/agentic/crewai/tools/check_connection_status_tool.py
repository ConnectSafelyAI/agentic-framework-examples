import os
import requests
from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class CheckConnectionStatusInput(BaseModel):
    """Input schema for CheckConnectionStatus tool."""
    profileId: str = Field(..., description="Profile ID (vanity name)")


class CheckConnectionStatusTool(BaseTool):
    name: str = "Check Connection Status"
    description: str = (
        "Check the connection status with a LinkedIn profile (connected, invitation sent, etc.). "
        "ALWAYS use this tool before sending connection requests to avoid duplicates. "
        "Returns whether you're already connected, have sent an invitation, or received one."
    )
    args_schema: Type[BaseModel] = CheckConnectionStatusInput

    def _run(self, profileId: str) -> dict[str, Any]:
        """Execute the tool to check connection status."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        try:
            response = requests.get(
                f"https://api.connectsafely.ai/linkedin/relationship/{profileId}",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
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
                "connected": bool(data.get("connected", False)),
                "invitationSent": bool(data.get("invitationSent", False)),
                "invitationReceived": bool(data.get("invitationReceived", False)),
            }

        except Exception as e:
            return {"success": False, "error": f"Error checking connection status: {str(e)}"}