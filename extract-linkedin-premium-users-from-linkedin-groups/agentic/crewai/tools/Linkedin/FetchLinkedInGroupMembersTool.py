import os
import requests
from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class FetchMembersInput(BaseModel):
    """Input schema for FetchLinkedInGroupMembers tool."""

    group_id: str = Field(..., description="The LinkedIn group ID to fetch members from")
    max_members: Optional[int] = Field(
        None, description="Maximum number of members to fetch (optional)"
    )


class FetchLinkedInGroupMembersTool(BaseTool):
    name: str = "Fetch LinkedIn Group Members"
    description: str = (
        "Fetch members from a LinkedIn group using ConnectSafely.ai. "
        "Automatically handles pagination and returns all members up to the specified limit. "
        "Use this tool to get raw member data from LinkedIn groups."
    )
    args_schema: Type[BaseModel] = FetchMembersInput

    def _run(self, group_id: str, max_members: Optional[int] = None) -> dict[str, Any]:
        """
        Execute the tool to fetch LinkedIn group members.
        
        Args:
            group_id: The LinkedIn group ID
            max_members: Optional maximum number of members to fetch
            
        Returns:
            Dictionary containing members list and metadata
        """
        api_token = os.getenv("CONNECTSAFELY_API_TOKEN")
        if not api_token:
            return {
                "success": False,
                "error": "CONNECTSAFELY_API_TOKEN not set in environment variables",
            }

        api_base_url = "https://api.connectsafely.ai"
        all_members = []
        start = 0
        count = 50
        has_more = True

        print(f"\n📥 Fetching members from LinkedIn group {group_id}...")

        try:
            while has_more and (not max_members or len(all_members) < max_members):
                response = requests.post(
                    f"{api_base_url}/linkedin/groups/members",
                    headers={
                        "Authorization": f"Bearer {api_token}",
                        "Content-Type": "application/json",
                    },
                    json={"groupId": group_id, "start": start, "count": count},
                    timeout=30,
                )

                if not response.ok:
                    return {
                        "success": False,
                        "error": f"ConnectSafely API error: {response.status_code} - {response.text}",
                    }

                data = response.json()
                batch = data.get("members", [])
                all_members.extend(batch)
                has_more = data.get("hasMore", False)
                start += count

                print(f"   Fetched {len(all_members)} members...")

                if max_members and len(all_members) >= max_members:
                    all_members = all_members[:max_members]
                    break

            print(f"✓ Total members fetched: {len(all_members)}\n")

            return {
                "success": True,
                "total_fetched": len(all_members),
                "members": all_members,
                "group_id": group_id,
            }

        except Exception as e:
            return {"success": False, "error": f"Error fetching members: {str(e)}"}

