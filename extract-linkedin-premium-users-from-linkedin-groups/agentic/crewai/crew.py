from crewai import Crew, Process
from agents.agents import LinkedInAgents
from tasks import LinkedInTasks


class LinkedInCrew:
    """Main crew for LinkedIn premium member extraction."""

    def __init__(self):
        """Initialize the crew with agents."""
        self.agents = LinkedInAgents()

    def complete_workflow(
        self,
        group_id: str,
        max_members: int | None = None,
        spreadsheet_title: str | None = None,
        export_to_sheets: bool = True,
    ) -> dict:
        """
        Execute complete workflow: fetch premium members and optionally export.
        
        Args:
            group_id: LinkedIn group ID
            max_members: Optional maximum number of members
            spreadsheet_title: Optional custom spreadsheet title
            export_to_sheets: Whether to export to Google Sheets
            
        Returns:
            Dictionary with complete results
        """
        # Create agents
        researcher = self.agents.linkedin_researcher()
        spreadsheet_manager = self.agents.spreadsheet_manager()

        # Create tasks
        tasks_factory = LinkedInTasks()

        # Main workflow task
        workflow_task = tasks_factory.complete_workflow_task(
            agent=researcher,
            group_id=group_id,
            max_members=max_members,
        )

        tasks = [workflow_task]

        # Add sheets export if requested
        if export_to_sheets:
            sheets_task = tasks_factory.export_to_sheets_task(
                agent=spreadsheet_manager,
                spreadsheet_title=spreadsheet_title,
                context=[workflow_task],
            )
            tasks.append(sheets_task)

        # Create and run crew
        crew = Crew(
            agents=[researcher, spreadsheet_manager] if export_to_sheets else [researcher],
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
        )

        print("\n🚀 Starting LinkedIn Premium Members Crew...")
        result = crew.kickoff()
        print("\n✅ Crew execution completed!\n")

        return {
            "success": True,
            "result": result,
            "workflow_completed": True,
            "sheets_exported": export_to_sheets,
        }

    def fetch_only(
        self,
        group_id: str,
        max_members: int | None = None,
    ) -> dict:
        """
        Fetch members without filtering or export.
        
        Args:
            group_id: LinkedIn group ID
            max_members: Optional maximum number of members
            
        Returns:
            Dictionary with fetched members
        """
        researcher = self.agents.linkedin_researcher()
        tasks_factory = LinkedInTasks()

        fetch_task = tasks_factory.fetch_members_task(
            agent=researcher,
            group_id=group_id,
            max_members=max_members,
        )

        crew = Crew(
            agents=[researcher],
            tasks=[fetch_task],
            process=Process.sequential,
            verbose=True,
        )

        print("\n🚀 Starting fetch-only workflow...")
        result = crew.kickoff()
        print("\n✅ Fetch completed!\n")

        return {"success": True, "result": result}

    def multi_step_workflow(
        self,
        group_id: str,
        max_members: int | None = None,
        spreadsheet_title: str | None = None,
    ) -> dict:
        """
        Execute multi-step workflow with separate agents for each step.
        
        Args:
            group_id: LinkedIn group ID
            max_members: Optional maximum number of members
            spreadsheet_title: Optional custom spreadsheet title
            
        Returns:
            Dictionary with complete results
        """
        # Create all agents
        researcher = self.agents.linkedin_researcher()
        analyst = self.agents.data_analyst()
        spreadsheet_manager = self.agents.spreadsheet_manager()

        # Create tasks factory
        tasks_factory = LinkedInTasks()

        # Step 1: Fetch members
        fetch_task = tasks_factory.fetch_members_task(
            agent=researcher,
            group_id=group_id,
            max_members=max_members,
        )

        # Step 2: Filter premium members
        filter_task = tasks_factory.filter_premium_task(
            agent=analyst,
            context=[fetch_task],
        )

        # Step 3: Export to sheets
        sheets_task = tasks_factory.export_to_sheets_task(
            agent=spreadsheet_manager,
            spreadsheet_title=spreadsheet_title,
            context=[filter_task],
        )

        # Create crew with all agents and tasks
        crew = Crew(
            agents=[researcher, analyst, spreadsheet_manager],
            tasks=[fetch_task, filter_task, sheets_task],
            process=Process.sequential,
            verbose=True,
        )

        print("\n🚀 Starting multi-step workflow with specialized agents...")
        result = crew.kickoff()
        print("\n✅ Multi-step workflow completed!\n")

        return {
            "success": True,
            "result": result,
            "workflow_completed": True,
            "sheets_exported": True,
        }
