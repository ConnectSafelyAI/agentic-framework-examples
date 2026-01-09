import os
import json
from dotenv import load_dotenv
import httpx
from datetime import datetime
from typing import Optional, List, Dict, Any

load_dotenv()

def complete_group_members_workflow(group_id: str, max_members: Optional[int] = None) -> str:
    """
    Complete workflow: Fetch ALL group members and filter for Premium/Verified.
    Does NOT save to sheets.

    Args:
        group_id (str): The LinkedIn group ID.
        max_members (Optional[int]): Optional maximum number of members to fetch before filtering.
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
        # Step 1: Fetching with Pagination
        with httpx.Client(timeout=60.0) as client:
            while has_more:
                payload = {"groupId": group_id, "start": start, "count": count}
                response = client.post(url, headers=headers, json=payload)
                
                if response.status_code != 200:
                    return f"Error: API returned {response.status_code}: {response.text}"
                
                data = response.json()
                batch = data.get("members", [])
                
                # Add timestamp metadata
                for member in batch:
                    member["fetchedAt"] = datetime.now().isoformat()
                
                all_members.extend(batch)
                has_more = bool(data.get("hasMore", False))
                start += count

                if max_members and len(all_members) >= max_members:
                    all_members = all_members[:max_members]
                    break
        
        # Step 2: Filtering Logic
        filtered = []
        for m in all_members:
            badges = m.get("badges", [])
            is_premium = m.get("isPremium", False)
            is_verified = m.get("isVerified", False)
            
            if is_premium or is_verified or "premium" in badges or "verified" in badges:
                filtered.append(m)

        result = {
            "totalFetched": len(all_members),
            "totalFiltered": len(filtered),
            "members": filtered,
        }
        
        return json.dumps(result)

    except Exception as e:
        return f"Workflow failed: {str(e)}"
