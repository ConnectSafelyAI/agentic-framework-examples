from typing import Any, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class FilterPremiumMembersInput(BaseModel):
    """Input schema for FilterPremiumMembers tool."""

    members: list = Field(..., description="List of LinkedIn member objects to filter")


class FilterPremiumMembersTool(BaseTool):
    name: str = "Filter Premium Members"
    description: str = (
        "Filter a list of LinkedIn members to only include Premium or Verified accounts. "
        "Identifies members with premium badges, verified status, or LinkedIn Premium subscription. "
        "Use this tool after fetching members to get only high-value profiles."
    )
    args_schema: Type[BaseModel] = FilterPremiumMembersInput

    def _run(self, members: list) -> dict[str, Any]:
        """
        Execute the tool to filter premium members.
        
        Args:
            members: List of LinkedIn member dictionaries
            
        Returns:
            Dictionary containing filtered members and statistics
        """
        print(f"\n🔍 Filtering for Premium/Verified members...")

        try:
            premium_members = []
            for member in members:
                badges = member.get("badges", [])
                is_premium = (
                    member.get("isPremium") is True
                    or member.get("isVerified") is True
                    or "premium" in badges
                    or "verified" in badges
                )

                if is_premium:
                    premium_members.append(member)

            print(
                f"✓ Found {len(premium_members)} premium/verified members "
                f"out of {len(members)} total\n"
            )

            return {
                "success": True,
                "total_filtered": len(premium_members),
                "total_original": len(members),
                "members": premium_members,
                "filter_rate": (
                    len(premium_members) / len(members) * 100 if members else 0
                ),
            }

        except Exception as e:
            return {"success": False, "error": f"Error filtering members: {str(e)}"}

