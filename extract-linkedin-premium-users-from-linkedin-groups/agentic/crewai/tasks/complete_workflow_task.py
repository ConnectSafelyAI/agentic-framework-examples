from crewai import Task
from crewai import Agent


class CompleteWorkflowTask:
    """Single task for complete workflow: fetch + filter."""

    @staticmethod
    def create(
        agent: Agent,
        group_id: str,
        max_members: int | None = None,
    ) -> Task:
        """
        Create single task for complete workflow: fetch + filter.
        
        Args:
            agent: The agent to assign this task to
            group_id: LinkedIn group ID
            max_members: Optional maximum number of members to fetch
        """
        description = f"""
        Execute the complete LinkedIn premium member extraction workflow.
        
        LinkedIn Group ID: {group_id}
        {f'Maximum members: {max_members}' if max_members else 'Fetch all available members'}
        
        Complete workflow steps:
        1. Fetch all members from the specified LinkedIn group using ConnectSafely.ai
        2. Filter the members to identify Premium/Verified profiles only
        3. Return comprehensive results with statistics
        
        Use the Complete LinkedIn Workflow tool for efficient execution.
        """

        expected_output = """
        Complete workflow results including:
        - Total members fetched from the group
        - Total premium/verified members identified
        - Filter success rate (percentage)
        - Full list of premium member profiles
        
        The output should be a structured dictionary containing:
        - success: boolean
        - group_id: string
        - total_fetched: integer
        - total_filtered: integer
        - filter_rate: float
        - members: list of premium member dictionaries
        """

        return Task(
            description=description,
            expected_output=expected_output,
            agent=agent,
        )

