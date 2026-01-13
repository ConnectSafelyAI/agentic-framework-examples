import os
from crewai import Agent, LLM
from tools import linkedin_tools


class JobSearchAgents:
    """Factory class for creating job search automation agents."""

    @staticmethod
    def _get_llm():
        """Get the Gemini LLM instance."""
        return LLM(
            model="gemini/gemini-2.0-flash-exp",
            temperature=0.1,  # Lower temperature for more consistent responses
            api_key=os.getenv("GEMINI_API_KEY")
        )

    @staticmethod
    def unified_agent() -> Agent:
        """Single agent that can execute any job search task on demand."""
        return Agent(
            role="LinkedIn Job Search Assistant",
            goal="Execute LinkedIn tasks and return clear, accurate results.",
            backstory=(
                "You execute LinkedIn automation tasks:\n"
                "- Job search: SearchGeoLocationTool + SearchJobsTool\n"
                "- Find managers: SearchHiringManagersTool\n"
                "- Connect: CheckConnectionStatusTool + SendConnectionRequestTool\n\n"
                "Return results in simple JSON format."
            ),
            tools=linkedin_tools,
            llm=JobSearchAgents._get_llm(),
            verbose=True,
            allow_delegation=False,
            max_iter=10,  # Limit iterations
            max_rpm=10,
        )
