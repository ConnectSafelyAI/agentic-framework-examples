"""Response processing and formatting utilities."""
import ast
from typing import Any


def extract_text_from_result(result: Any) -> str:
    """Extracts text content from AutoGen result object."""
    text_response = ""
    if hasattr(result, 'messages'):
        for msg in reversed(result.messages):
            if hasattr(msg, 'content') and msg.source != 'user':
                if isinstance(msg.content, str):
                    text_response = msg.content
                    break
                elif isinstance(msg.content, list):
                    parts = [
                        p if isinstance(p, str) else p.get('text', '')
                        for p in msg.content
                        if isinstance(p, (str, dict))
                    ]
                    text_response = "\n".join(parts)
                    break
    
    return text_response or str(result)


def format_connection_success(data: dict) -> str:
    """Formats connection success response with message and URL."""
    profile_id = data.get('profileId', 'Unknown')
    msg_sent = data.get('customMessage', 'No custom message.')
    url = f"https://www.linkedin.com/in/{profile_id}"
    
    return (
        f"✅ **Connection request sent successfully to {profile_id}**\n\n"
        f"📝 **Invitation Message:**\n_{msg_sent}_\n\n"
        f"🔗 **Profile URL:**\n[{url}]({url})"
    )


def format_hiring_managers(data: dict) -> str:
    """Formats hiring managers list response."""
    count = len(data['people'])
    out = f"👤 **Found {count} Hiring Managers:**\n"
    for p in data['people']:
        p_url = p.get('profileUrl') or f"https://www.linkedin.com/in/{p.get('profileId')}"
        out += f"- **{p.get('name')}** ({p.get('headline')})\n  ID: `{p.get('profileId')}` | [View Profile]({p_url})\n"
    return out


def clean_response(result: Any) -> str:
    """Cleans and formats AutoGen response for display."""
    text_response = extract_text_from_result(result)
    cleaned = text_response.strip()

    if cleaned.startswith("{") or cleaned.startswith("["):
        try:
            data = ast.literal_eval(cleaned)
            if isinstance(data, dict):
                if 'status' in data and 'sent' in str(data.get('status')):
                    return format_connection_success(data)
                if 'people' in data:
                    return format_hiring_managers(data)
        except Exception:
            pass
    
    return text_response
