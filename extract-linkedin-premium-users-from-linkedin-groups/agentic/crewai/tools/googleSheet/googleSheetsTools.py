from typing import Any, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from .googleSheetsClient import GoogleSheetsClient


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
        "LinkedIn Members", description="Sheet name within the spreadsheet"
    )


class GoogleSheetsTool(BaseTool):
    name: str = "Google Sheets Export"
    description: str = (
        "Create or update a Google Sheet with LinkedIn members. "
        "Automatically handles OAuth authentication, creates spreadsheets, "
        "detects duplicates, and formats data professionally."
    )
    args_schema: Type[BaseModel] = GoogleSheetsInput

    def _run(
        self,
        members: list,
        spreadsheet_title: Optional[str] = None,
        spreadsheet_id: Optional[str] = None,
        sheet_name: str = "LinkedIn Members",
    ) -> dict[str, Any]:
        """Execute the tool to save members to Google Sheets."""
        print(f"\n💾 Google Sheets Export invoked with {len(members)} members")
        client = GoogleSheetsClient()

        try:
            # 1. Setup Spreadsheet
            is_new = False
            if not spreadsheet_id:
                sheet_data = client.create_sheet(spreadsheet_title, sheet_name)
                spreadsheet_id = sheet_data["id"]
                spreadsheet_url = sheet_data["url"]
                spreadsheet_title = sheet_data["title"]
                is_new = True
                
                # Add headers
                headers = ["Profile ID", "First Name", "Last Name", "Full Name", 
                          "Headline", "Public Identifier", "Profile URL", "Follower Count",
                          "Is Premium", "Is Verified", "Badges", "Relationship Status"]
                client.append_data(spreadsheet_id, sheet_name, [headers])
                print(f"✓ Created spreadsheet: {spreadsheet_url}")
            else:
                spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"

            # 2. Filter Duplicates
            existing_ids = client.get_existing_ids(spreadsheet_id, sheet_name)
            rows = []
            for m in members:
                pid = m.get("profileId", "")
                if pid and pid not in existing_ids:
                    rows.append([
                        pid, m.get("firstName", ""), m.get("lastName", ""),
                        m.get("fullName") or m.get("name", ""), m.get("headline", ""),
                        m.get("publicIdentifier", ""), m.get("profileUrl", ""),
                        m.get("followerCount", ""), m.get("isPremium", ""),
                        m.get("isVerified", ""), ", ".join(m.get("badges", [])),
                        m.get("relationshipStatus", "")
                    ])

            # 3. Write Data
            if rows:
                client.append_data(spreadsheet_id, sheet_name, rows)
                print(f"✓ Added {len(rows)} new members")
            else:
                print("⚠️ No new members to add (duplicates skipped)")

            return {
                "success": True,
                "spreadsheet_url": spreadsheet_url,
                "spreadsheet_title": spreadsheet_title,
                "members_added": len(rows),
                "members_skipped": len(members) - len(rows),
                "is_new_sheet": is_new,
                "summary": f"{'Created' if is_new else 'Updated'} sheet with {len(rows)} members."
            }

        except Exception as e:
            return {"success": False, "error": f"Google Sheets error: {str(e)}"}


google_sheets_tool = GoogleSheetsTool()
