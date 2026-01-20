import os
import re
import requests
from typing import Dict, Any, Optional
from crewai.tools import tool


@tool("Search LinkedIn People")
def search_people(
    keywords: str,
    location: Optional[str] = None,
    title: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Search for LinkedIn people/profiles using ConnectSafely.ai API.
    Returns detailed profile information for export to Google Sheets.

    Args:
        keywords: Search terms (e.g., "CEO SaaS", "Software Engineer")
        location: Geographic filter (e.g., "United States", "San Francisco")
        title: Job title filter (e.g., "Head of Growth", "CTO")
        limit: Maximum number of results to return (default: 100)

    Returns:
        Dict with list of people profiles or error message.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    endpoint = "https://api.connectsafely.ai/linkedin/search/people"

    payload = {
        "keywords": keywords,
        "limit": min(limit, 100)
    }

    if location:
        payload["location"] = location
    if title:
        payload["title"] = title

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

        if isinstance(data, list):
            data = data[0] if data else {}

        if not data.get("success", True):
            return {
                "success": False,
                "error": data.get("error", "Unknown API error")
            }

        people = data.get("people", [])
        pagination = data.get("pagination", {})
        has_more = data.get("hasMore", False)

        formatted_people = []
        for person in people:
            company = _extract_company(person.get("headline", ""))

            formatted_people.append({
                "profileUrl": person.get("profileUrl", ""),
                "profileId": person.get("profileId", ""),
                "profileUrn": person.get("profileUrn", ""),
                "fullName": f"{person.get('firstName', '')} {person.get('lastName', '')}".strip(),
                "firstName": person.get("firstName", ""),
                "lastName": person.get("lastName", ""),
                "headline": person.get("headline", ""),
                "currentPosition": person.get("currentPosition", ""),
                "company": company,
                "location": person.get("location", ""),
                "connectionDegree": person.get("connectionDegree", ""),
                "isPremium": person.get("isPremium", False),
                "isOpenToWork": person.get("isOpenToWork", False),
                "profilePicture": person.get("profilePicture", ""),
            })

        return {
            "success": True,
            "people": formatted_people,
            "count": len(formatted_people),
            "pagination": pagination,
            "hasMore": has_more,
            "searchParams": {
                "keywords": keywords,
                "location": location,
                "title": title,
                "limit": limit
            }
        }

    except Exception as e:
        return {"success": False, "error": f"Exception during people search: {str(e)}"}


def _extract_company(headline: str) -> str:
    """Extract company name from LinkedIn headline."""
    if not headline:
        return ""

    match = re.search(r'(?:at|@|-)\s*([^|]+?)(?:\s*\||$)', headline, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""
