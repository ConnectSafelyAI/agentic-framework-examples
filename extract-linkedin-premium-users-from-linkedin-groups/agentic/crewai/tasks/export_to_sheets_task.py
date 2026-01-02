from crewai import Task
from crewai import Agent


class ExportToSheetsTask:
    """Task to export members to Google Sheets."""

    @staticmethod
    def create(
        agent: Agent,
        spreadsheet_title: str | None = None,
        context: list[Task] | None = None,
    ) -> Task:
        """
        Create task to export members to Google Sheets.
        
        Args:
            agent: The agent to assign this task to
            spreadsheet_title: Optional custom spreadsheet title
            context: Previous tasks to use as context
        """
        title_instruction = (
            f'Spreadsheet title: "{spreadsheet_title}"'
            if spreadsheet_title
            else "Auto-generate a descriptive spreadsheet title with timestamp"
        )

        description = f"""
        Export the filtered premium LinkedIn members to Google Sheets.
        
        {title_instruction}
        
        Requirements:
        - Create a new spreadsheet (or update existing if spreadsheet_id provided)
        - Add professional column headers
        - Format data clearly with frozen header row
        - Check for and skip duplicate profiles (by Profile ID)
        - Provide the shareable spreadsheet URL
        
        Ensure the spreadsheet is:
        - Well-formatted and easy to read
        - Free of duplicates
        - Accessible via the returned URL
        """

        expected_output = """
        A detailed report of the Google Sheets export including:
        - Spreadsheet URL (shareable link)
        - Spreadsheet title
        - Number of members added
        - Number of duplicates skipped
        - Success/error status
        
        The output should be a structured dictionary containing:
        - success: boolean
        - spreadsheet_url: string
        - spreadsheet_title: string
        - members_added: integer
        - members_skipped: integer
        - summary: string describing the operation
        """

        return Task(
            description=description,
            expected_output=expected_output,
            agent=agent,
            context=context or [],
        )

