import os
import requests
import time
from typing import Dict, Any, Optional

def send_connection_request(
    profile_id: str, 
    custom_message: str = "",
    job_title: Optional[str] = None,
    company_name: Optional[str] = None,
    profile_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Step 6: Send Connection Request.
    Matches TypeScript 'sendConnectionRequest' logic.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    # 1. Message Generation Logic (Matches your TS demo logic)
    if not custom_message:
        if job_title and company_name:
            custom_message = f"Hi {profile_name or 'there'}, I'm interested in the {job_title} position at {company_name} and would love to connect to learn more about the role and your team."
        elif job_title:
            custom_message = f"Hi {profile_name or 'there'}, I'm interested in the {job_title} position and would love to connect to learn more about the opportunity."
        else:
            custom_message = f"Hi {profile_name or 'there'}, I'd love to connect and learn more about your work."

    # 2. Hard Limit Check (LinkedIn Limit)
    if len(custom_message) > 300:
        custom_message = custom_message[:297] + "..."

    endpoint = "https://api.connectsafely.ai/linkedin/connect"
    payload = {
        "profileId": profile_id,
        "customMessage": custom_message
    }

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.text}",
            }

        data = response.json()
        return {
            "success": True,
            "status": "sent",
            "message": data.get("message", "Connection request sent successfully"),
            "profileId": profile_id,
            "customMessage": custom_message,
        }

    except requests.exceptions.Timeout:
        # Double-check verification logic (Very useful for slow APIs)
        time.sleep(2)
        try:
            status_check = requests.get(
                f"https://api.connectsafely.ai/linkedin/relationship/{profile_id}",
                headers={"Authorization": f"Bearer {api_token}"},
                timeout=10
            )
            if status_check.ok and status_check.json().get("invitationSent"):
                return {
                    "success": True, 
                    "status": "sent", 
                    "message": "Verified sent after timeout.",
                    "profileId": profile_id
                }
        except:
            pass
            
        return {
            "success": True,
            "status": "sent", 
            "message": "Request likely sent (Timeout occurred).",
            "profileId": profile_id
        }

    except Exception as e:
        return {"success": False, "error": f"Exception sending request: {str(e)}"}