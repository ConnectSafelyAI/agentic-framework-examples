import os
from crewai import Agent, LLM
from tools import linkedin_tools, google_sheets_tool


class LinkedInAgents:
    """Factory class for creating LinkedIn automation agents."""

    @staticmethod
    def _get_llm():
        """Get the Gemini LLM instance."""
        return LLM(
            model="gemini/gemini-3-pro-preview",
            temperature=0.7,
            api_key=os.getenv("GEMINI_API_KEY")
        )

    @staticmethod
    def linkedin_researcher() -> Agent:
        """
        Agent responsible for fetching and analyzing LinkedIn group members.
        """
        return Agent(
            role="LinkedIn Data Researcher",
            goal=(
                "Extract comprehensive member data from LinkedIn groups using ConnectSafely.ai "
                "and identify Premium/Verified profiles"
            ),
            backstory=(
                "You are an expert LinkedIn data researcher with deep knowledge of "
                "professional networking platforms. You specialize in using ConnectSafely.ai "
                "to extract high-quality member data from LinkedIn groups. Your expertise "
                "includes identifying premium members, verified accounts, and understanding "
                "LinkedIn's profile hierarchy. You always provide accurate, complete data "
                "while respecting platform guidelines."
            ),
            tools=linkedin_tools,
            llm=LinkedInAgents._get_llm(),
            verbose=True,
            allow_delegation=False,
        )

    @staticmethod
    def data_analyst() -> Agent:
        """
        Agent responsible for analyzing and filtering member data.
        """
        return Agent(
            role="Data Quality Analyst",
            goal=(
                "Analyze member data to identify premium profiles and ensure data quality "
                "and completeness"
            ),
            backstory=(
                "You are a meticulous data analyst specializing in LinkedIn profile analysis. "
                "You have a keen eye for identifying premium LinkedIn members based on "
                "profile badges, verification status, and premium indicators. You ensure "
                "data quality by validating profile completeness and filtering out "
                "low-quality or incomplete profiles. Your analysis helps identify the "
                "most valuable connections and leads."
            ),
            tools=linkedin_tools,
            llm=LinkedInAgents._get_llm(),
            verbose=True,
            allow_delegation=False,
        )

    @staticmethod
    def spreadsheet_manager() -> Agent:
        """
        Agent responsible for managing Google Sheets exports.
        """
        return Agent(
            role="Spreadsheet Manager",
            goal=(
                "Organize and export LinkedIn member data to well-formatted Google Sheets "
                "with proper deduplication and professional presentation"
            ),
            backstory=(
                "You are a spreadsheet automation expert who specializes in creating "
                "perfectly organized and professional Google Sheets. You handle OAuth "
                "authentication seamlessly, ensure data is properly formatted, and always "
                "check for duplicates before adding new entries. Your spreadsheets are "
                "known for their clean structure, frozen headers, and easy-to-read format. "
                "You make data accessible and actionable for business teams."
            ),
            tools=[google_sheets_tool],
            llm=LinkedInAgents._get_llm(),
            verbose=True,
            allow_delegation=False,
        )
