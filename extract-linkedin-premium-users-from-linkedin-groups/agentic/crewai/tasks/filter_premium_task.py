from crewai import Task
from crewai import Agent


class FilterPremiumTask:
    """Task to filter members for Premium/Verified profiles."""

    @staticmethod
    def create(
        agent: Agent,
        context: list[Task] | None = None,
    ) -> Task:
        """
        Create task to filter members for Premium/Verified profiles.
        
        Args:
            agent: The agent to assign this task to
            context: Previous tasks to use as context
        """
        description = """
        Analyze the fetched LinkedIn members and filter for Premium/Verified profiles.
        
        Identify members with:
        - LinkedIn Premium subscription (isPremium = true)
        - Verified accounts (isVerified = true)
        - Premium badges in their profile
        - Any other premium indicators
        
        Calculate statistics:
        - Total premium members found
        - Percentage of premium members
        - Quality metrics
        
        Return only the premium/verified members for export.
        """

        expected_output = """
        A filtered list containing only Premium/Verified LinkedIn members with:
        - Total number of premium members identified
        - Filter success rate (percentage of premium members)
        - Complete member profiles for premium accounts only
        
        The output should be a structured dictionary containing:
        - success: boolean
        - total_filtered: integer
        - filter_rate: float (percentage)
        - members: list of premium member dictionaries
        """

        return Task(
            description=description,
            expected_output=expected_output,
            agent=agent,
            context=context or [],
        )

