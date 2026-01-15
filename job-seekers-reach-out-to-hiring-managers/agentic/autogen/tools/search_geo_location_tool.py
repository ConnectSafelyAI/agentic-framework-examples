import os
import requests
from typing import Dict, Any

def search_geo_location(keywords: str) -> Dict[str, Any]:
    """
    Step 0: Search for geographic locations to get the numeric location_id.
    Matches the TypeScript 'searchGeoLocation' logic.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    endpoint = "https://api.connectsafely.ai/linkedin/search/geo"
    
    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json={"keywords": keywords},
            timeout=30,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.text}",
            }

        data = response.json()
        locations = data.get("locations", [])
        
        # Logic matches TS: const australiaId = locations[0]?.id
        if locations:
            first_match = locations[0]
            # Robustly check for 'geoId' (API standard) OR 'id' (TS script usage)
            location_id = first_match.get("geoId") or first_match.get("id")
            
            return {
                "success": True,
                "location_id": str(location_id), # Ensure string for consistency
                "location_name": first_match.get("name"),
                "all_locations": locations 
            }
        
        return {
            "success": True,
            "error": "No locations found for these keywords.",
            "location_id": None
        }

    except Exception as e:
        return {"success": False, "error": f"Exception during geo search: {str(e)}"}