import json
from typing import List, Dict, Any

def filter_premium_verified_members(members: List[Dict[str, Any]]) -> str:
    """
    Filter an array of LinkedIn members to only include Premium or Verified profiles.

    Args:
        members (List[Dict[str, Any]]): Array of LinkedIn member objects to filter. 
            Each object should contain keys like 'isPremium', 'isVerified', and 'badges'.
    """
    filtered = []
    
    for m in members:
        # Extract fields with default values to avoid KeyErrors
        badges = m.get("badges", [])
        is_premium = m.get("isPremium", False)
        is_verified = m.get("isVerified", False)
        
        # Checking for Boolean flags or string presence in the badges array
        has_premium_flag = is_premium is True
        has_verified_flag = is_verified is True
        has_premium_badge = "premium" in badges
        has_verified_badge = "verified" in badges
        
        if any([has_premium_flag, has_verified_flag, has_premium_badge, has_verified_badge]):
            filtered.append(m)

    result = {
        "totalInput": len(members),
        "totalFiltered": len(filtered),
        "members": filtered,
    }
    
    print(result)
    return json.dumps(result)