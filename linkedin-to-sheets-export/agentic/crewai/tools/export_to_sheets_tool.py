import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from crewai.tools import tool


@tool("Export to Google Sheets")
def export_to_sheets(
    people: List[Dict[str, Any]],
    spreadsheet_id: Optional[str] = None,
    sheet_name: str = "Sheet1"
) -> Dict[str, Any]:
    """
    Export LinkedIn search results to Google Sheets.

    Args:
        people: List of people dictionaries from search_people results
        spreadsheet_id: Google Sheets ID (from URL). If not provided, uses env var.
        sheet_name: Name of the sheet/tab to append to (default: "Sheet1")

    Returns:
        Dict with success status, rows exported count, or error message.
    """
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        return {
            "success": False,
            "error": "gspread and google-auth packages required."
        }

    creds_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
    if not creds_file:
        return {
            "success": False,
            "error": "GOOGLE_SHEETS_CREDENTIALS_FILE environment variable not set"
        }

    if not os.path.exists(creds_file):
        return {
            "success": False,
            "error": f"Credentials file not found: {creds_file}"
        }

    sheet_id = spreadsheet_id or os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
    if not sheet_id:
        return {
            "success": False,
            "error": "Spreadsheet ID not provided and GOOGLE_SHEETS_SPREADSHEET_ID not set"
        }

    try:
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive"
        ]
        credentials = Credentials.from_service_account_file(creds_file, scopes=scopes)
        client = gspread.authorize(credentials)

        spreadsheet = client.open_by_key(sheet_id)

        try:
            worksheet = spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=20)

        headers = [
            "profileUrl", "fullName", "firstName", "lastName",
            "headline", "currentPosition", "company", "location",
            "connectionDegree", "isPremium", "isOpenToWork",
            "profilePicture", "profileId", "extractedAt"
        ]

        existing_headers = worksheet.row_values(1)
        if not existing_headers:
            worksheet.append_row(headers)

        timestamp = datetime.now().isoformat()
        rows = []
        for person in people:
            row = [
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
                person.get("profileId", ""),
                timestamp
            ]
            rows.append(row)

        if rows:
            worksheet.append_rows(rows)

        return {
            "success": True,
            "rows_exported": len(rows),
            "spreadsheet_id": sheet_id,
            "sheet_name": sheet_name,
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{sheet_id}"
        }

    except Exception as e:
        return {"success": False, "error": f"Export failed: {str(e)}"}
