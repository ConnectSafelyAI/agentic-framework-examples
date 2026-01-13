import os
import requests
from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class GetCompanyDetailsInput(BaseModel):
    """Input schema for GetCompanyDetails tool."""
    companyId: str = Field(..., description="Company ID or universal name")


class GetCompanyDetailsTool(BaseTool):
    name: str = "Get Company Details"
    description: str = (
        "Get detailed information about a company by company ID or universal name. "
        "Use this tool to retrieve comprehensive company information including description, "
        "website, industry, and other relevant details."
    )
    args_schema: Type[BaseModel] = GetCompanyDetailsInput

    def _run(self, companyId: str) -> dict[str, Any]:
        """Execute the tool to get company details."""
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        try:
            response = requests.post(
                "https://api.connectsafely.ai/linkedin/search/companies/details",
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={"companyId": companyId},
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
                "company": data.get("company", {}),
            }

        except Exception as e:
            return {"success": False, "error": f"Error getting company details: {str(e)}"}