from crewai import Crew, Process, Task
from agents.agents import JobSearchAgents


class JobSearchWorkflows:
    """Handles command-based task execution."""

    def __init__(self):
        self.agent = JobSearchAgents.unified_agent()

    def execute_command(self, command: str, context: str | None = None) -> any:
        """Execute a user command."""
        # Limit context size to prevent overwhelming the model
        if context and len(context) > 1500:
            context = context[-1500:]
        
        # Build task description
        if context:
            task_description = f"""Context: {context}

Task: {command}

Use context data if needed."""
        else:
            task_description = command
        
        # Set clear expected output based on command type
        if "connect" in command.lower():
            expected = (
                "Return JSON:\n"
                '{"manager": {profileId, firstName, lastName}, "connectionSent": true/false, "message": "status"}'
            )
        elif "manager" in command.lower():
            expected = '{"managers": [{profileId, firstName, lastName, headline, profileUrl}]}'
        elif any(word in command.lower() for word in ["find", "search", "job"]):
            expected = '{"jobs": [{jobId, title, companyName, companyId, location}]}'
        else:
            expected = "Return result in clear JSON format."
        
        task = Task(
            description=task_description,
            expected_output=expected,
            agent=self.agent,
        )
        
        print(f"\n🚀 Executing: {command}")
        
        try:
            result = Crew(
                agents=[self.agent],
                tasks=[task],
                process=Process.sequential,
                verbose=True,
                max_rpm=10,
            ).kickoff()
            print(f"\n✅ Completed!\n")
            return result
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")
            return {
                "success": False,
                "error": str(e),
                "command": command
            }
