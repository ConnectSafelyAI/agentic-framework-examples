from .fetch_members_task import FetchMembersTask
from .filter_premium_task import FilterPremiumTask
from .export_to_sheets_task import ExportToSheetsTask
from .complete_workflow_task import CompleteWorkflowTask
from crewai import Agent, Task

class LinkedInTasks:
    """Factory class for creating LinkedIn automation tasks."""
    
    @staticmethod
    def fetch_members_task(agent: Agent, group_id: str, max_members: int | None = None) -> Task:
        return FetchMembersTask.create(agent, group_id, max_members)
        
    @staticmethod
    def filter_premium_task(agent: Agent, context: list[Task] | None = None) -> Task:
        return FilterPremiumTask.create(agent, context)
        
    @staticmethod
    def export_to_sheets_task(agent: Agent, spreadsheet_title: str | None = None, context: list[Task] | None = None) -> Task:
        return ExportToSheetsTask.create(agent, spreadsheet_title, context)
        
    @staticmethod
    def complete_workflow_task(agent: Agent, group_id: str, max_members: int | None = None) -> Task:
        return CompleteWorkflowTask.create(agent, group_id, max_members)

__all__ = [
    "LinkedInTasks",
    "FetchMembersTask",
    "FilterPremiumTask",
    "ExportToSheetsTask",
    "CompleteWorkflowTask",
]

