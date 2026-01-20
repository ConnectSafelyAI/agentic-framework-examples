"""CrewAI Agent Definitions for LinkedIn to Sheets Export."""

import os
from crewai import Agent, LLM
from tools import (
    search_geo_location,
    search_people,
    export_to_sheets,
    export_to_json
)


def create_export_agent() -> Agent:
    """
    Create the LinkedIn Export agent with all necessary tools.

    Returns:
        Configured CrewAI Agent instance
    """
    # Configure LLM
    llm = LLM(
        model="gemini/gemini-2.5-pro",
        api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7,
    )

    agent = Agent(
        role="LinkedIn Export Specialist",
        goal="Search LinkedIn profiles and export results to Google Sheets or JSON files",
        backstory="""You are an expert at searching LinkedIn for specific types of
        professionals and exporting the data efficiently. You help users find people
        by keywords, location, and job title, then export the results to their
        preferred format (Google Sheets or JSON).

        You are thorough in your searches and careful with data exports. You always
        confirm search parameters before executing and provide clear summaries of
        results before exporting.""",
        tools=[
            search_geo_location,
            search_people,
            export_to_sheets,
            export_to_json
        ],
        llm=llm,
        verbose=True,
        memory=True,
        allow_delegation=False,
    )

    return agent
