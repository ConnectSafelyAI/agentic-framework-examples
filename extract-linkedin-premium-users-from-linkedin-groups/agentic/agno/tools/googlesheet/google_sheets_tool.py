import os
from dotenv import load_dotenv
import json
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional

load_dotenv()

def get_access_token() -> str:
    """Refreshes the Google OAuth access token using the refresh token."""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise ValueError("Missing Google OAuth environment variables.")

    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    with httpx.Client() as client:
        response = client.post(url, data=data)
        if response.status_code != 200:
            raise Exception(f"Failed to refresh Google token: {response.text}")
        return response.json().get("access_token")

def google_sheets_tool(
    members: List[Dict[str, Any]], 
    spreadsheet_title: Optional[str] = None, 
    spreadsheet_id: Optional[str] = None, 
    sheet_name: str = "LinkedIn Members"
) -> str:
    """
    Create or update a Google Sheet with LinkedIn group members.
    Automatically handles OAuth token refresh and skips duplicates by Profile ID.

    Args:
        members (List[Dict[str, Any]]): Array of LinkedIn member objects to write.
        spreadsheet_title (Optional[str]): Title for a new spreadsheet.
        spreadsheet_id (Optional[str]): Existing spreadsheet ID to update.
        sheet_name (str): Name of the sheet tab (default: 'LinkedIn Members').
    """
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    col_headers = [
        "Profile ID", "First Name", "Last Name", "Full Name", "Headline",
        "Public Identifier", "Profile URL", "Follower Count", "Is Premium",
        "Is Verified", "Badges", "Relationship Status"
    ]

    is_new_sheet = False
    final_spreadsheet_id = spreadsheet_id

    # 1. Create Spreadsheet if ID is missing
    if not final_spreadsheet_id:
        is_new_sheet = True
        title = spreadsheet_title or f"LinkedIn Premium Members - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        create_url = "https://sheets.googleapis.com/v4/spreadsheets"
        body = {
            "properties": {"title": title},
            "sheets": [{"properties": {"title": sheet_name, "gridProperties": {"frozenRowCount": 1}}}]
        }
        
        with httpx.Client() as client:
            res = client.post(create_url, headers=headers, json=body)
            res.raise_for_status()
            data = res.json()
            final_spreadsheet_id = data["spreadsheetId"]
            spreadsheet_url = data.get("spreadsheetUrl", f"https://docs.google.com/spreadsheets/d/{final_spreadsheet_id}")
            
            # Add header row to new sheet
            append_url = f"https://sheets.googleapis.com/v4/spreadsheets/{final_spreadsheet_id}/values/{sheet_name}!A1:append?valueInputOption=USER_ENTERED"
            client.post(append_url, headers=headers, json={"values": [col_headers]})
    else:
        spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{final_spreadsheet_id}"

    # 2. Duplicate Detection (Read existing Profile IDs)
    existing_ids = set()
    read_url = f"https://sheets.googleapis.com/v4/spreadsheets/{final_spreadsheet_id}/values/{sheet_name}"
    with httpx.Client() as client:
        res = client.get(read_url, headers=headers)
        if res.status_code == 200:
            sheet_values = res.json().get("values", [])
            if len(sheet_values) > 1:  # Skip headers
                for row in sheet_values[1:]:
                    if row: existing_ids.add(str(row[0]))

    # 3. Prepare Rows
    rows_to_add = []
    for m in members:
        p_id = str(m.get("profileId", ""))
        if p_id and p_id not in existing_ids:
            rows_to_add.append([
                p_id, m.get("firstName", ""), m.get("lastName", ""),
                m.get("fullName", ""), m.get("headline", ""),
                m.get("publicIdentifier", ""), m.get("profileUrl", ""),
                m.get("followerCount", ""), m.get("isPremium", ""),
                m.get("isVerified", ""), ", ".join(m.get("badges", [])),
                m.get("relationshipStatus", "")
            ])

    # 4. Append New Rows
    members_added = 0
    if rows_to_add:
        append_url = f"https://sheets.googleapis.com/v4/spreadsheets/{final_spreadsheet_id}/values/{sheet_name}:append?valueInputOption=USER_ENTERED"
        with httpx.Client() as client:
            res = client.post(append_url, headers=headers, json={"values": rows_to_add})
            res.raise_for_status()
            members_added = len(rows_to_add)

    result = {
        "success": True,
        "spreadsheetId": final_spreadsheet_id,
        "spreadsheetUrl": spreadsheet_url,
        "membersAdded": members_added,
        "membersSkipped": len(members) - members_added,
        "isNewSheet": is_new_sheet,
        "summary": f"{'Created' if is_new_sheet else 'Updated'} sheet with {members_added} new members."
    }
    return json.dumps(result)