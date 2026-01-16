import os
import requests
from typing import Dict, Any, Optional


def search_jobs(
    location_id: str,
    keywords: str = "software engineer",
    count: int = 5,
    start: int = 0,
    date_posted: str = "past-week"
) -> Dict[str, Any]:
    """Search for LinkedIn jobs by keywords and location. Returns list of jobs with job IDs.
    
    Args:
        location_id: Geographic location ID from search_geo_location (REQUIRED)
        keywords: Job search keywords (e.g., 'Software Engineer', 'Product Manager')
        count: Number of jobs to return (default 5, max 25)
        start: Pagination offset (default 0)
        date_posted: Date filter - 'past-24-hours', 'past-week', 'past-month' (default 'past-week')
    
    Returns:
        Dict with 'success', 'jobs' list containing job details (title, company, location, jobId), and 'total' count
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    try:
        payload = {
            "keywords": keywords,
            "count": min(count, 25),
            "start": start,
            "filters": {
                "datePosted": date_posted,
                "locationId": location_id,
            },
        }

        response = requests.post(
            "https://api.connectsafely.ai/linkedin/search/jobs",
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"ConnectSafely API error: {response.status_code} - {response.text}",
            }

        data = response.json()
        return {
            "success": True,
            "jobs": data.get("jobs", []),
            "total": data.get("total"),
        }

    except Exception as e:
        return {"success": False, "error": f"Error searching jobs: {str(e)}"}
