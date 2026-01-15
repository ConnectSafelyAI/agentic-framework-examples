import os
import requests
import re
from typing import Dict, Any

def extract_profile_id_from_url(profile_input: str) -> str:
    """
    Helper: Extract vanity name from LinkedIn URL.
    Matches the regex logic from the TS script: /linkedin\.com\/in\/([^\/\?]+)/
    """
    if not profile_input.startswith(('http://', 'https://')):
        return profile_input
    
    pattern = r'linkedin\.com/in/([^/?]+)'
    match = re.search(pattern, profile_input)
    if match:
        return match.group(1)
    
    return profile_input

def fetch_profile_details(profile_id: str) -> Dict[str, Any]:
    """
    Step 4: Fetch Profile Details.
    Matches TypeScript 'fetchProfileDetails' logic.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    # Ensure we are using the vanity name (clean ID), not a URL
    clean_id = extract_profile_id_from_url(profile_id)
    
    endpoint = "https://api.connectsafely.ai/linkedin/profile"

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json={"profileId": clean_id},
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
            "profile": data.get("profile", {}),
            # Return the clean ID so the agent can use it for the next step (connection)
            "profileId": clean_id 
        }

    except Exception as e:
        return {"success": False, "error": f"Exception fetching profile: {str(e)}"}