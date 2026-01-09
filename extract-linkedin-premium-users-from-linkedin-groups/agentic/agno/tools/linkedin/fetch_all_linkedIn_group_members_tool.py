import os
from dotenv import load_dotenv
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime

load_dotenv()

def fetch_all_linkedin_group_members(group_id: str, max_members: Optional[int] = None) -> str:
    """
    Fetch ALL LinkedIn group members with automatic pagination.
    
    Args:
        group_id (str): The LinkedIn group ID.
        max_members (Optional[int]): Optional maximum number of members to fetch.
    Returns:
        str: A JSON string containing totalFetched and the list of members.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN", "")
    url = "https://api.connectsafely.ai/linkedin/groups/members"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }
    
    start = 0
    count = 50
    has_more = True
    all_members: List[Dict[str, Any]] = []

    try:
        # Use httpx for efficient synchronous requests
        with httpx.Client(timeout=30.0) as client:
            while has_more:
                payload = {"groupId": group_id, "start": start, "count": count}
                response = client.post(url, headers=headers, json=payload)
                
                if response.status_code != 200:
                    return f"Error: API returned status {response.status_code}: {response.text}"
                
                data = response.json()
                batch = data.get("members", [])
                
                # Add metadata similar to your TS implementation
                for member in batch:
                    member["fetchedAt"] = datetime.now().isoformat()
                
                all_members.extend(batch)
                has_more = bool(data.get("hasMore", False))
                start += count

                if max_members and len(all_members) >= max_members:
                    all_members = all_members[:max_members]
                    break
        
        result = {
            "totalFetched": len(all_members),
            "members": all_members
        }
        import json
        return json.dumps(result)

    except Exception as e:
        return f"Error during pagination fetch: {str(e)}"