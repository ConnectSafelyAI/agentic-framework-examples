import os
from dotenv import load_dotenv
import httpx
import json
from typing import Optional

load_dotenv()

def fetch_linkedin_group_members(group_id: str, start: int = 0, count: int = 50) -> str:
    """
    Fetch a single paginated batch of LinkedIn group members. Use for low-level control.
    
    Args:
        group_id (str): The LinkedIn group ID.
        start (int): Starting offset for pagination (default 0).
        count (int): Number of members to fetch, max 100 (default 50).
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN", "")
    url = "https://api.connectsafely.ai/linkedin/groups/members"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "groupId": group_id,
        "start": start,
        "count": count
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Formating the return to match your TS tool's output structure
            result = {
                "members": data.get("members", []),
                "hasMore": data.get("hasMore", False),
                "fetched": len(data.get("members", []))
            }
            return json.dumps(result)
            
    except Exception as e:
        return f"Error fetching batch: {str(e)}"