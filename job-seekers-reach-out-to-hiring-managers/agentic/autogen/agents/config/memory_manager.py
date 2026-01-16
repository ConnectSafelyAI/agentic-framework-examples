"""Memory management for job search results and context."""
import ast
from typing import List, Dict


class MemoryManager:
    """Manages job search results and context memory."""
    
    def __init__(self):
        self.last_search_results: List[Dict] = []
    
    def should_reset_memory(self, command: str) -> bool:
        """Determines if memory should be reset based on command."""
        lower_cmd = command.lower()
        return "find" in lower_cmd and "job" in lower_cmd and "id" not in lower_cmd
    
    def reset_memory(self):
        """Clears stored job search results."""
        self.last_search_results = []
    
    def build_memory_context(self, command: str) -> str:
        """Builds memory context string from stored job results."""
        memory_context = ""
        if self.last_search_results:
            for job in self.last_search_results:
                if str(job.get('jobId')) in command:
                    memory_context += f"\n💡 DATA FOUND for Job ID {job.get('jobId')}:\n"
                    memory_context += f"   - Company: {job.get('companyName')}\n"
                    memory_context += f"   - Company ID: {job.get('companyId')} <--- REQUIRED\n"
                    memory_context += f"   - Job Title: {job.get('title')}\n"
        return memory_context
    
    def extract_job_results(self, response_text: str):
        """Extracts and stores job results from response text."""
        if '"jobs": [{' in response_text or "'jobs': [{" in response_text:
            try:
                start = response_text.find("[{")
                end = response_text.rfind("}]") + 2
                if start != -1:
                    self.last_search_results = ast.literal_eval(response_text[start:end])
            except Exception:
                pass
