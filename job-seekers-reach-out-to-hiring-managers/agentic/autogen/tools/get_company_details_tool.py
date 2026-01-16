import os
import requests
from typing import Dict, Any

def get_company_details(company_id: str) -> Dict[str, Any]:
    """
    Step 2: Get Company Details.
    Matches TypeScript 'getCompanyDetails' logic.
    Useful for verifying the exact company name or getting more metadata.
    """
    api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
    if not api_token:
        return {
            "success": False,
            "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
        }

    endpoint = "https://api.connectsafely.ai/linkedin/search/companies/details"

    try:
        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json={"companyId": company_id},
            timeout=30,
        )

        if not response.ok:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.text}",
            }

        data = response.json()
        
        return {
            "success": True,
            "company": data.get("company", {}),
            # Pass through the ID so the agent doesn't lose track of it
            "company_id": company_id 
        }

    except Exception as e:
        return {"success": False, "error": f"Exception fetching company details: {str(e)}"}