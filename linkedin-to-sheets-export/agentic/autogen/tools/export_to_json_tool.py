import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


def export_to_json(
    people: List[Dict[str, Any]],
    output_dir: Optional[str] = None,
    filename: Optional[str] = None
) -> Dict[str, Any]:
    """
    Export LinkedIn search results to a JSON file.

    Args:
        people: List of people dictionaries from search_people results
        output_dir: Directory to save the file (default: current directory)
        filename: Custom filename (default: auto-generated with timestamp)

    Returns:
        Dict with success status, file path, or error message.
    """
    # Set default output directory
    if not output_dir:
        output_dir = os.getcwd()

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Generate filename if not provided
    if not filename:
        timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
        filename = f"linkedin-export-{timestamp}.json"

    # Ensure .json extension
    if not filename.endswith(".json"):
        filename += ".json"

    file_path = os.path.join(output_dir, filename)

    try:
        # Add metadata and timestamp to each record
        export_timestamp = datetime.now().isoformat()
        export_data = {
            "exportedAt": export_timestamp,
            "totalCount": len(people),
            "people": []
        }

        for person in people:
            person_data = {
                "profileUrl": person.get("profileUrl", ""),
                "profileId": person.get("profileId", ""),
                "profileUrn": person.get("profileUrn", ""),
                "fullName": person.get("fullName", ""),
                "firstName": person.get("firstName", ""),
                "lastName": person.get("lastName", ""),
                "headline": person.get("headline", ""),
                "currentPosition": person.get("currentPosition", ""),
                "company": person.get("company", ""),
                "location": person.get("location", ""),
                "connectionDegree": person.get("connectionDegree", ""),
                "isPremium": person.get("isPremium", False),
                "isOpenToWork": person.get("isOpenToWork", False),
                "profilePicture": person.get("profilePicture", ""),
                "extractedAt": export_timestamp
            }
            export_data["people"].append(person_data)

        # Write JSON file with pretty formatting
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        return {
            "success": True,
            "file_path": file_path,
            "filename": filename,
            "records_exported": len(people),
            "file_size_bytes": os.path.getsize(file_path)
        }

    except PermissionError:
        return {
            "success": False,
            "error": f"Permission denied: Cannot write to {file_path}"
        }
    except Exception as e:
        return {"success": False, "error": f"Export failed: {str(e)}"}
