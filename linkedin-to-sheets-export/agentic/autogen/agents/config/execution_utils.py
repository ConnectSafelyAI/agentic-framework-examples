"""Execution Utilities - Helper functions for agent execution."""

import re


def is_raw_output(response_text: str) -> bool:
    """
    Check if response is raw tool output that needs further processing.

    Args:
        response_text: The agent's response text

    Returns:
        True if the response appears to be raw tool output
    """
    # Indicators of raw JSON/dict output
    raw_indicators = [
        response_text.strip().startswith("{"),
        response_text.strip().startswith("["),
        "'success': True" in response_text,
        '"success": true' in response_text.lower(),
        "'error':" in response_text and len(response_text) < 500,
    ]

    return any(raw_indicators)


def get_continuation_instruction(response_text: str) -> str:
    """
    Generate instruction for the agent to continue processing raw output.

    Args:
        response_text: The raw tool output

    Returns:
        Instruction string for the next turn
    """
    if "error" in response_text.lower():
        return "The tool returned an error. Please explain this to the user and suggest alternatives."

    if "people" in response_text.lower() or "profiles" in response_text.lower():
        return (
            "Parse these search results and present a clear summary to the user. "
            "Include: total count, a few example profiles (name, title, company), "
            "and ask if they want to export to Google Sheets or JSON."
        )

    if "rows_exported" in response_text.lower() or "records_exported" in response_text.lower():
        return (
            "The export was successful. Summarize the results for the user "
            "including the number of records and the destination (URL or file path)."
        )

    if "spreadsheet_url" in response_text.lower():
        return "Provide the Google Sheets URL to the user and confirm the export was successful."

    if "file_path" in response_text.lower():
        return "Provide the JSON file path to the user and confirm the export was successful."

    return "Please process this output and provide a clear response to the user."


def extract_count_from_response(response_text: str) -> int:
    """
    Extract a count/number from the response text.

    Args:
        response_text: Response text that may contain counts

    Returns:
        Extracted count or 0 if not found
    """
    # Try to find patterns like "25 profiles" or "found 25"
    patterns = [
        r'(\d+)\s*(?:profiles?|people|records?|results?)',
        r'(?:found|exported|count[:\s]+)\s*(\d+)',
        r'"count":\s*(\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, response_text, re.IGNORECASE)
        if match:
            return int(match.group(1))

    return 0
