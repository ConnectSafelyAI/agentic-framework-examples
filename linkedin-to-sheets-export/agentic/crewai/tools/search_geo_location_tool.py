import os
import requests
from typing import Dict, Any
from crewai.tools import tool


@tool("Search Geographic Location")
def search_geo_location(keywords: str) -> Dict[str, Any]:
    """
    Search for geographic locations to get the numeric location_id.
    Used to convert location names (e.g., "United States") to LinkedIn geo IDs.

    Args:
        keywords: Location name to search for (e.g., "United States", "San Francisco")

    Returns:
        Dict with location_id if found, or error message if not.
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

        if locations:
            first_match = locations[0]
            location_id = first_match.get("geoId") or first_match.get("id")

            return {
                "success": True,
                "location_id": str(location_id),
                "location_name": first_match.get("name"),
                "all_locations": locations[:5]
            }

        return {
            "success": True,
            "error": "No locations found for these keywords.",
            "location_id": None
        }

    except Exception as e:
        return {"success": False, "error": f"Exception during geo search: {str(e)}"}
