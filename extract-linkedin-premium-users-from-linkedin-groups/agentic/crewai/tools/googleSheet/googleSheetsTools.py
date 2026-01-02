import os
import requests
from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class GoogleSheetsInput(BaseModel):
    """Input schema for GoogleSheets tool."""

    members: list = Field(..., description="List of LinkedIn member objects to save")
    spreadsheet_title: Optional[str] = Field(
        None, description="Title for the new spreadsheet (auto-generated if not provided)"
    )
    spreadsheet_id: Optional[str] = Field(
        None, description="Existing spreadsheet ID to update (creates new if not provided)"
    )
    sheet_name: Optional[str] = Field(
        "LinkedIn Members",
        description="Sheet name within the spreadsheet",
    )


class GoogleSheetsTool(BaseTool):
    name: str = "Google Sheets Export"
    description: str = (
        "Create or update a Google Sheet with LinkedIn members. "
        "Automatically handles OAuth authentication, creates spreadsheets, "
        "detects duplicates, and formats data professionally. "
        "Use this tool to save member data to Google Sheets for easy access and sharing."
    )
    args_schema: Type[BaseModel] = GoogleSheetsInput

    def _get_access_token(self) -> str:
        """Get Google OAuth access token from refresh token."""
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")

        if not all([client_id, client_secret, refresh_token]):
            raise ValueError(
                "Google OAuth credentials not configured. "
                "Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "
                "and GOOGLE_REFRESH_TOKEN in .env file"
            )

        response = requests.post(
            "https://oauth2.googleapis.com/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=10,
        )

        if not response.ok:
            raise ValueError(f"Failed to refresh access token: {response.text}")

        return response.json()["access_token"]

    def _run(
        self,
        members: list,
        spreadsheet_title: Optional[str] = None,
        spreadsheet_id: Optional[str] = None,
        sheet_name: str = "LinkedIn Members",
    ) -> dict[str, Any]:
        """
        Execute the tool to save members to Google Sheets.
        
        Args:
            members: List of LinkedIn member dictionaries
            spreadsheet_title: Optional title for new spreadsheet
            spreadsheet_id: Optional existing spreadsheet ID
            sheet_name: Name of the sheet
            
        Returns:
            Dictionary containing spreadsheet URL and statistics
        """
        print(f"\n💾 Google Sheets Export invoked with {len(members)} members")

        try:
            # Get access token
            access_token = self._get_access_token()

            # Auto-generate title if needed
            from datetime import datetime

            auto_title = f"LinkedIn Premium Members - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            final_title = spreadsheet_title or auto_title

            # Define headers
            headers = [
                "Profile ID",
                "First Name",
                "Last Name",
                "Full Name",
                "Headline",
                "Public Identifier",
                "Profile URL",
                "Follower Count",
                "Is Premium",
                "Is Verified",
                "Badges",
                "Relationship Status",
            ]

            spreadsheet_url = None
            is_new_sheet = False

            # Create spreadsheet if needed
            if not spreadsheet_id:
                print(f'📝 Creating new spreadsheet: "{final_title}"')

                create_response = requests.post(
                    "https://sheets.googleapis.com/v4/spreadsheets",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "properties": {"title": final_title},
                        "sheets": [
                            {
                                "properties": {
                                    "title": sheet_name,
                                    "gridProperties": {"frozenRowCount": 1},
                                }
                            }
                        ],
                    },
                    timeout=30,
                )

                if not create_response.ok:
                    return {
                        "success": False,
                        "error": f"Failed to create spreadsheet: {create_response.text}",
                    }

                create_data = create_response.json()
                spreadsheet_id = create_data["spreadsheetId"]
                spreadsheet_url = create_data["spreadsheetUrl"]
                is_new_sheet = True

                print(f"✓ Created spreadsheet: {spreadsheet_url}")

                # Add headers
                requests.post(
                    f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
                    f"/values/{sheet_name}!A1:append?valueInputOption=USER_ENTERED",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                    },
                    json={"values": [headers]},
                    timeout=30,
                )

                print("✓ Added header row")
            else:
                spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"

            # Read existing data for duplicate detection
            read_response = requests.get(
                f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
                f"/values/{sheet_name}",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=30,
            )

            existing_profile_ids = set()
            if read_response.ok:
                sheet_data = read_response.json()
                existing_rows = sheet_data.get("values", [])[1:]  # Skip header
                for row in existing_rows:
                    if row and len(row) > 0:
                        existing_profile_ids.add(str(row[0]))

            print(f"📋 Found {len(existing_profile_ids)} existing profile(s) in sheet")

            # Prepare rows (skip duplicates)
            rows = []
            for member in members:
                profile_id = member.get("profileId", "")
                if profile_id not in existing_profile_ids:
                    row = [
                        profile_id,
                        member.get("firstName", ""),
                        member.get("lastName", ""),
                        member.get("fullName") or member.get("name", ""),
                        member.get("headline", ""),
                        member.get("publicIdentifier", ""),
                        member.get("profileUrl", ""),
                        member.get("followerCount", ""),
                        member.get("isPremium", ""),
                        member.get("isVerified", ""),
                        ", ".join(member.get("badges", [])),
                        member.get("relationshipStatus", ""),
                    ]
                    rows.append(row)

            members_skipped = len(members) - len(rows)
            members_added = 0

            # Append rows
            if rows:
                print(f"➕ Adding {len(rows)} new member(s) to sheet")

                append_response = requests.post(
                    f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
                    f"/values/{sheet_name}:append?valueInputOption=USER_ENTERED",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                    },
                    json={"values": rows},
                    timeout=30,
                )

                if not append_response.ok:
                    return {
                        "success": False,
                        "error": f"Failed to append rows: {append_response.text}",
                    }

                members_added = len(rows)
                print(f"✓ Successfully added {members_added} member(s)")
            else:
                print(f"⚠️  All {len(members)} member(s) already exist (duplicates skipped)")

            # Return result
            summary = (
                f"{'Created' if is_new_sheet else 'Updated'} spreadsheet "
                f'"{final_title}" with {members_added} new members'
            )
            if members_skipped > 0:
                summary += f" ({members_skipped} duplicates skipped)"

            result = {
                "success": True,
                "spreadsheet_id": spreadsheet_id,
                "spreadsheet_url": spreadsheet_url,
                "spreadsheet_title": final_title,
                "sheet_name": sheet_name,
                "members_added": members_added,
                "members_skipped": members_skipped,
                "is_new_sheet": is_new_sheet,
                "summary": summary,
            }

            print(f"\n✓ {summary}")
            print(f"✓ Spreadsheet URL: {spreadsheet_url}\n")

            return result

        except Exception as e:
            return {"success": False, "error": f"Google Sheets error: {str(e)}"}


# Export the tool
google_sheets_tool = GoogleSheetsTool()