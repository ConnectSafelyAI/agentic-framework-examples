import os
import requests
import re
from typing import Dict, Any, Optional, List

def search_hiring_managers(
    company_id: str,
    job_title: Optional[str] = None,
    count: Optional[int] = 5
) -> Dict[str, Any]:
    """
    Step 3: Search Hiring Managers.
    Matches TypeScript 'searchHiringManagers' logic + Vanity Name Extraction.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    # 1. Determine manager title (Logic matches TS script + extended)
    search_title = "Hiring Manager OR Recruiter"
    if job_title:
        lower_title = job_title.lower()
        if "engineer" in lower_title or "developer" in lower_title:
            search_title = "Engineering Manager OR VP Engineering OR CTO"
        elif "sales" in lower_title:
            search_title = "Sales Director OR VP Sales"
        elif "marketing" in lower_title:
            search_title = "Marketing Director OR CMO"
        elif "product" in lower_title:
            search_title = "Product Manager OR VP Product OR CPO"

    endpoint = "https://api.connectsafely.ai/linkedin/search/people"

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json={
                "keywords": search_title,
                "count": min(count, 10),
                "filters": {
                    "currentCompanyIds": [company_id],
                    "connectionDegree": ["S", "O"],  # 2nd and 3rd+ connections
                },
            },
            timeout=30,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.text}",
            }

        data = response.json()
        raw_people = data.get("people", [])
        
        valid_people = []
        
        # 2. Extract Vanity Name (Matches TS Logic)
        for person in raw_people:
            vanity_name = person.get("publicIdentifier")
            
            # Fallback: Extract from profileUrl if publicIdentifier is missing
            if not vanity_name and person.get("profileUrl"):
                match = re.search(r"linkedin\.com/in/([^/\?]+)", person.get("profileUrl", ""))
                if match:
                    vanity_name = match.group(1)
            
            # Only add if we successfully resolved a usable ID
            if vanity_name:
                valid_people.append({
                    "name": f"{person.get('firstName', '')} {person.get('lastName', '')}",
                    "firstName": person.get("firstName"),
                    "lastName": person.get("lastName"),
                    "headline": person.get("headline"),
                    "profileId": vanity_name, # CRITICAL: Use vanity name as the ID for next steps
                    "profileUrl": person.get("profileUrl")
                })
        
        return {
            "success": True,
            "people": valid_people,
        }

    except Exception as e:
        return {"success": False, "error": f"Exception searching managers: {str(e)}"}