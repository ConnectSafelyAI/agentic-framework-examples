from agents.assistant import LinkedInAssistant


class JobSearchWorkflows:
    """Handles command-based task execution with AutoGen."""
    
    def __init__(self):
        self.assistant = LinkedInAssistant()
    
    def execute_command(self, command: str, context: str | None = None) -> any:
        """Execute a user command."""
        # Limit context size
        if context and len(context) > 1500:
            context = context[-1500:]
        
        print(f"\n🚀 Executing: {command}")
        
        try:
            result = self.assistant.execute_command(command, context)
            print(f"\n✅ Completed!\n")
            return result
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")
            return {
                "success": False,
                "error": str(e),
                "command": command
            }
