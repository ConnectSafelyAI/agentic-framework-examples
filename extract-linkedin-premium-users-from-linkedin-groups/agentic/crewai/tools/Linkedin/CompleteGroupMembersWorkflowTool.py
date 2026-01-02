from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from .FetchLinkedInGroupMembersTool import FetchLinkedInGroupMembersTool
from .FilterPremiumMembersTool import FilterPremiumMembersTool


class CompleteWorkflowInput(BaseModel):
    """Input schema for CompleteGroupMembersWorkflow tool."""

    group_id: str = Field(..., description="The LinkedIn group ID to fetch members from")
    max_members: Optional[int] = Field(
        None, description="Maximum number of members to fetch (optional)"
    )


class CompleteGroupMembersWorkflowTool(BaseTool):
    name: str = "Complete LinkedIn Workflow"
    description: str = (
        "Complete end-to-end workflow to fetch LinkedIn group members and automatically "
        "filter for Premium/Verified profiles using ConnectSafely.ai. "
        "This is the recommended tool for most use cases as it combines fetching and filtering. "
        "Returns ready-to-export premium member data."
    )
    args_schema: Type[BaseModel] = CompleteWorkflowInput

    def _run(self, group_id: str, max_members: Optional[int] = None) -> dict[str, Any]:
        """
        Execute complete workflow: fetch + filter premium members.
        
        Args:
            group_id: The LinkedIn group ID
            max_members: Optional maximum number of members to fetch
            
        Returns:
            Dictionary containing premium members and statistics
        """
        print(f"\n🚀 Starting Complete Workflow for Group {group_id}")

        try:
            # Step 1: Fetch members
            fetch_tool = FetchLinkedInGroupMembersTool()
            fetch_result = fetch_tool._run(group_id=group_id, max_members=max_members)

            if not fetch_result.get("success"):
                return fetch_result

            # Step 2: Filter for premium members
            filter_tool = FilterPremiumMembersTool()
            filter_result = filter_tool._run(members=fetch_result["members"])

            if not filter_result.get("success"):
                return filter_result

            # Combine results
            result = {
                "success": True,
                "group_id": group_id,
                "total_fetched": fetch_result["total_fetched"],
                "total_filtered": filter_result["total_filtered"],
                "filter_rate": filter_result["filter_rate"],
                "members": filter_result["members"],
            }

            print(f"✓ Workflow complete!")
            print(f"   Total fetched: {result['total_fetched']}")
            print(f"   Premium/Verified: {result['total_filtered']}")
            print(f"   Filter rate: {result['filter_rate']:.1f}%\n")

            return result

        except Exception as e:
            return {"success": False, "error": f"Workflow error: {str(e)}"}

