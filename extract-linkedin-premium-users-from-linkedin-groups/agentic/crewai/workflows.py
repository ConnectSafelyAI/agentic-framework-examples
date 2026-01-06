from crewai import Crew, Process
from agents.agents import LinkedInAgents
from tasks import LinkedInTasks


class LinkedInWorkflows:
    """Handles the assembly and execution of CrewAI workflows."""

    def __init__(self):
        self.agents = LinkedInAgents()
        self.tasks = LinkedInTasks()

    def run_complete(
        self,
        group_id: str,
        max_members: int | None = None,
        spreadsheet_title: str | None = None,
        export_to_sheets: bool = True,
    ):
        """Run the single-agent complete workflow."""
        researcher = self.agents.linkedin_researcher()
        task = self.tasks.complete_workflow_task(researcher, group_id, max_members)
        tasks = [task]
        agents = [researcher]

        if export_to_sheets:
            manager = self.agents.spreadsheet_manager()
            tasks.append(
                self.tasks.export_to_sheets_task(manager, spreadsheet_title, [task])
            )
            agents.append(manager)

        return self._run_crew(agents, tasks, "Complete Workflow")

    def run_fetch_only(self, group_id: str, max_members: int | None = None):
        """Run the fetch-only workflow."""
        agent = self.agents.linkedin_researcher()
        task = self.tasks.fetch_members_task(agent, group_id, max_members)
        return self._run_crew([agent], [task], "Fetch Only")

    def run_multi_step(
        self, group_id: str, max_members: int | None = None, spreadsheet_title: str | None = None
    ):
        """Run the multi-agent detailed workflow."""
        res = self.agents.linkedin_researcher()
        analyst = self.agents.data_analyst()
        manager = self.agents.spreadsheet_manager()

        t1 = self.tasks.fetch_members_task(res, group_id, max_members)
        t2 = self.tasks.filter_premium_task(analyst, [t1])
        t3 = self.tasks.export_to_sheets_task(manager, spreadsheet_title, [t2])

        return self._run_crew([res, analyst, manager], [t1, t2, t3], "Multi-Step")

    def _run_crew(self, agents, tasks, name):
        """Helper to initialize and kick off a crew."""
        print(f"\n🚀 Starting {name}...")
        result = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
        ).kickoff()
        print(f"\n✅ {name} completed!\n")
        return result

