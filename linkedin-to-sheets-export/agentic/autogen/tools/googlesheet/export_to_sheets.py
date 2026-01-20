"""Google Sheets export function for LinkedIn search results."""

from typing import Dict, Any, List, Optional
from datetime import datetime
from .client import GoogleSheetsClient


HEADERS = [
    "Profile ID",
    "Profile URL",
    "Full Name",
    "First Name",
    "Last Name",
    "Headline",
    "Current Position",
    "Company",
    "Location",
    "Connection Degree",
    "Is Premium",
    "Is Open To Work",
    "Profile Picture",
    "Extracted At",
]


def export_to_sheets(
    people: List[Dict[str, Any]],
    spreadsheet_id: Optional[str] = None,
    spreadsheet_title: Optional[str] = None,
    sheet_name: str = "LinkedIn People",
) -> Dict[str, Any]:
    """Export LinkedIn search results to Google Sheets using OAuth authentication."""
    try:
        client = GoogleSheetsClient()

        if not spreadsheet_title and not spreadsheet_id:
            now = datetime.now()
            spreadsheet_title = f"LinkedIn People Export - {now.strftime('%Y-%m-%d %H:%M')}"

        is_new_sheet = False

        if not spreadsheet_id:
            result = client.create_spreadsheet(spreadsheet_title, sheet_name, HEADERS)
            spreadsheet_id = result["id"]
            spreadsheet_url = result["url"]
            is_new_sheet = True
        else:
            spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"

        existing_profile_ids = client.get_existing_profile_ids(
            spreadsheet_id, sheet_name
        )

        timestamp = datetime.now().isoformat()
        rows = []
        for person in people:
            profile_id = person.get("profileId", "")
            if profile_id and profile_id not in existing_profile_ids:
                rows.append(
                    [
                        profile_id,
                        person.get("profileUrl", ""),
                        person.get("fullName", ""),
                        person.get("firstName", ""),
                        person.get("lastName", ""),
                        person.get("headline", ""),
                        person.get("currentPosition", ""),
                        person.get("company", ""),
                        person.get("location", ""),
                        person.get("connectionDegree", ""),
                        str(person.get("isPremium", False)),
                        str(person.get("isOpenToWork", False)),
                        person.get("profilePicture", ""),
                        timestamp,
                    ]
                )

        people_skipped = len(people) - len(rows)
        people_added = 0

        if rows:
            client.append_data(spreadsheet_id, sheet_name, rows)
            people_added = len(rows)

        return {
            "success": True,
            "spreadsheet_id": spreadsheet_id,
            "spreadsheet_url": spreadsheet_url,
            "spreadsheet_title": spreadsheet_title or "Existing Spreadsheet",
            "sheet_name": sheet_name,
            "people_added": people_added,
            "people_skipped": people_skipped,
            "is_new_sheet": is_new_sheet,
            "summary": f"{'Created' if is_new_sheet else 'Updated'} spreadsheet with {people_added} new people{' (' + str(people_skipped) + ' duplicates skipped)' if people_skipped > 0 else ''}",
        }

    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Export failed: {str(e)}"}

