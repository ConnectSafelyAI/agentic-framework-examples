import os
import requests
import time
from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class SendConnectionRequestInput(BaseModel):
    """Input schema for SendConnectionRequest tool."""
    profileId: str = Field(..., description="Profile ID (vanity name)")
    customMessage: str = Field(..., description="Custom message to include with the connection request (max 300 characters)")


class SendConnectionRequestTool(BaseTool):
    name: str = "Send Connection Request"
    description: str = (
        "Send a LinkedIn connection request with a custom message. "
        "IMPORTANT: Always check connection status first using CheckConnectionStatusTool before sending. "
        "Do not send if already connected or if an invitation was already sent. "
        "The message should be personalized and reference the specific job opportunity."
    )
    args_schema: Type[BaseModel] = SendConnectionRequestInput

    def _run(self, profileId: str, customMessage: str) -> dict[str, Any]:
        """Execute the tool to send a connection request."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        # Truncate message if too long (LinkedIn limit is typically 300 characters)
        if len(customMessage) > 300:
            customMessage = customMessage[:297] + "..."

        try:
            response = requests.post(
                "https://api.connectsafely.ai/linkedin/connect",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "profileId": profileId,
                    "customMessage": customMessage,
                },
                timeout=60,  # Increased timeout to 60 seconds
            )

            if not response.ok:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                error_message = error_data.get("message", response.text) if error_data else response.text
                return {
                    "success": False,
                    "error": f"API error {response.status_code}: {error_message}",
                }

            data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
            return {
                "success": True,
                "message": data.get("message", "Connection request sent successfully"),
                "profileId": profileId,
            }

        except requests.exceptions.Timeout:
            # Timeout occurred - verify if request actually went through
            time.sleep(2)
            
            try:
                # Check connection status to verify if request succeeded
                status_response = requests.get(
                    f"https://api.connectsafely.ai/linkedin/relationship/{profileId}",
                    headers={
                        "Authorization": f"Bearer {api_token}",
                        "Content-Type": "application/json",
                    },
                    timeout=10,
                )
                
                if status_response.ok:
                    status_data = status_response.json()
                    if status_data.get("invitationSent", False):
                        # Request actually succeeded despite timeout
                        return {
                            "success": True,
                            "message": "Connection request sent successfully (verified after timeout)",
                            "profileId": profileId,
                        }
                    elif status_data.get("connected", False):
                        return {
                            "success": True,
                            "message": "Already connected",
                            "profileId": profileId,
                        }
            except:
                pass
            
            # Couldn't verify - return success with note
            return {
                "success": True,
                "message": "Connection request likely sent (timeout occurred but request may have succeeded)",
                "profileId": profileId,
                "note": "Request timed out - check LinkedIn to confirm",
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending connection request: {str(e)}",
                "profileId": profileId,
            }
