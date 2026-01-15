import os
import requests
from typing import Dict, Any

def check_connection_status(profile_id: str) -> Dict[str, Any]:
    """
    Step 5: Check Connection Status.
    Matches TypeScript 'checkConnectionStatus' logic.
    Used to prevent sending duplicate connection requests.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    # Ensure we use the clean vanity name if possible, though the function signature expects it
    endpoint = f"https://api.connectsafely.ai/linkedin/relationship/{profile_id}"

    try:
        response = requests.get(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.text}",
            }

        data = response.json()
        
        return {
            "success": True,
            "connected": bool(data.get("connected", False)),
            "invitationSent": bool(data.get("invitationSent", False)),
            "invitationReceived": bool(data.get("invitationReceived", False)),
            # Pass back the ID for continuity
            "profileId": profile_id 
        }

    except Exception as e:
        return {"success": False, "error": f"Exception checking status: {str(e)}"}