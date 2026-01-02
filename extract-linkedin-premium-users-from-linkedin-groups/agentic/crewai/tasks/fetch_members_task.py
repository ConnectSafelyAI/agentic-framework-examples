from crewai import Task
from crewai import Agent


class FetchMembersTask:
    """Task to fetch LinkedIn group members."""

    @staticmethod
    def create(
        agent: Agent,
        group_id: str,
        max_members: int | None = None,
    ) -> Task:
        """
        Create task to fetch LinkedIn group members.
        
        Args:
            agent: The agent to assign this task to
            group_id: LinkedIn group ID
            max_members: Optional maximum number of members to fetch
        """
        description = f"""
        Fetch members from LinkedIn group ID: {group_id}
        {f'Maximum members to fetch: {max_members}' if max_members else 'Fetch all available members'}
        
        Use the ConnectSafely.ai tools to extract member data including:
        - Profile IDs and names
        - Headlines and job titles
        - Premium/Verified status
        - Follower counts
        - Profile URLs
        
        Ensure all available data fields are captured.
        """

        expected_output = """
        A comprehensive list of LinkedIn group members with the following information:
        - Total number of members fetched
        - Complete member profiles with all available fields
        - Success/error status
        
        The output should be a structured dictionary containing:
        - success: boolean
        - total_fetched: integer
        - members: list of member dictionaries
        - group_id: string
        """

        return Task(
            description=description,
            expected_output=expected_output,
            agent=agent,
        )

