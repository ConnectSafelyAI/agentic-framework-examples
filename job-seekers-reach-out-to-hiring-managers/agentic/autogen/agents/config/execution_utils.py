"""Execution utilities for assistant command processing."""


def is_raw_output(response_text: str) -> bool:
    """Checks if response is raw tool output that needs processing."""
    return (
        "{'success': True" in response_text or 
        "'location_id':" in response_text or 
        "'jobId':" in response_text or
        "'people': [" in response_text
    )


def get_continuation_instruction(response_text: str) -> str:
    """Gets continuation instruction based on response type."""
    if "'people': [" in response_text:
        return "I have the list. If user said CONNECT, pick the best one and send request. If user said FIND, list ALL of them."
    return "Continue logic."
