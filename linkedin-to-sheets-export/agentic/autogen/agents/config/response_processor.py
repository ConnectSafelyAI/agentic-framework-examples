"""Response Processor - Cleans and formats agent responses."""

import re
from typing import Any


def clean_response(result: Any) -> str:
    """
    Clean and format the agent's response for display.

    Args:
        result: Raw result from agent.run()

    Returns:
        Cleaned response string
    """
    if result is None:
        return "No response received."

    # Handle different result types
    if hasattr(result, "chat_message"):
        response_text = str(result.chat_message.content)
    elif hasattr(result, "messages") and result.messages:
        # Get the last assistant message
        for msg in reversed(result.messages):
            if hasattr(msg, "content") and msg.content:
                response_text = str(msg.content)
                break
        else:
            response_text = str(result)
    else:
        response_text = str(result)

    # Clean up common formatting issues
    response_text = _clean_formatting(response_text)

    return response_text


def _clean_formatting(text: str) -> str:
    """Remove excessive whitespace and formatting artifacts."""
    # Remove multiple consecutive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)

    # Remove leading/trailing whitespace from entire text
    text = text.strip()

    return text
