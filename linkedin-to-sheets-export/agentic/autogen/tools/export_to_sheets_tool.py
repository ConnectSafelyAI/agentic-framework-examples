import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


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

    Note:
        Requires Google Sheets API credentials set up via:
        - GOOGLE_SHEETS_CREDENTIALS_FILE: Path to service account JSON
        - GOOGLE_SHEETS_SPREADSHEET_ID: Default spreadsheet ID (optional)
    """
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        return {
            "success": False,
            "error": "gspread and google-auth packages required. Install with: pip install gspread google-auth"
        }

    # Get credentials file path
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

    # Get spreadsheet ID
    sheet_id = spreadsheet_id or os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
    if not sheet_id:
        return {
            "success": False,
            "error": "Spreadsheet ID not provided and GOOGLE_SHEETS_SPREADSHEET_ID not set"
        }

    try:
        # Set up credentials with required scopes
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive"
        ]
        credentials = Credentials.from_service_account_file(creds_file, scopes=scopes)
        client = gspread.authorize(credentials)

        # Open spreadsheet
        spreadsheet = client.open_by_key(sheet_id)

        # Get or create sheet
        try:
            worksheet = spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=20)

        # Define headers
        headers = [
            "profileUrl", "fullName", "firstName", "lastName",
            "headline", "currentPosition", "company", "location",
            "connectionDegree", "isPremium", "isOpenToWork",
            "profilePicture", "profileId", "extractedAt"
        ]

        # Check if headers exist, add if not
        existing_headers = worksheet.row_values(1)
        if not existing_headers:
            worksheet.append_row(headers)

        # Prepare rows for export
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

        # Batch append rows
        if rows:
            worksheet.append_rows(rows)

        return {
            "success": True,
            "rows_exported": len(rows),
            "spreadsheet_id": sheet_id,
            "sheet_name": sheet_name,
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{sheet_id}"
        }

    except gspread.exceptions.APIError as e:
        return {
            "success": False,
            "error": f"Google Sheets API error: {str(e)}"
        }
    except Exception as e:
        return {"success": False, "error": f"Export failed: {str(e)}"}
