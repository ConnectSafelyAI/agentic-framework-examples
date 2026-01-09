import os
from dotenv import load_dotenv
import httpx
import json
from typing import Optional

load_dotenv()

def fetch_group_members_by_url(group_url: str, count: int = 20, start: int = 0) -> str:
    """
    Resolve a LinkedIn group URL to extract groupId and fetch members.

    Args:
        group_url (str): The full LinkedIn group URL.
        count (int): Number of members to fetch (default 20).
        start (int): Starting offset (default 0).
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN", "")
    url = "https://api.connectsafely.ai/linkedin/groups/members-by-url"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }
    payload = {"groupUrl": group_url, "start": start, "count": count}

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return json.dumps(response.json())
    except Exception as e:
        return f"Error fetching by URL: {str(e)}"