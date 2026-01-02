import requests
from typing import Any, Optional
from datetime import datetime
from .googleSheetsAuth import get_access_token


class GoogleSheetsClient:
    """Wrapper for Google Sheets API operations."""

    def __init__(self):
        self.base_url = "https://sheets.googleapis.com/v4/spreadsheets"

    def create_sheet(self, title: str | None, sheet_name: str) -> dict[str, str]:
        """Create a new spreadsheet."""
        token = get_access_token()
        auto_title = f"LinkedIn Premium Members - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        final_title = title or auto_title

        print(f'📝 Creating new spreadsheet: "{final_title}"')

        response = requests.post(
            self.base_url,
            headers=self._headers(token),
            json={
                "properties": {"title": final_title},
                "sheets": [{"properties": {"title": sheet_name, "gridProperties": {"frozenRowCount": 1}}}],
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return {
            "id": data["spreadsheetId"],
            "url": data["spreadsheetUrl"],
            "title": final_title,
        }

    def append_data(self, spreadsheet_id: str, sheet_name: str, values: list[list]) -> bool:
        """Append rows to a sheet."""
        if not values:
            return False

        token = get_access_token()
        url = f"{self.base_url}/{spreadsheet_id}/values/{sheet_name}:append?valueInputOption=USER_ENTERED"
        
        response = requests.post(
            url,
            headers=self._headers(token),
            json={"values": values},
            timeout=30,
        )
        response.raise_for_status()
        return True

    def get_existing_ids(self, spreadsheet_id: str, sheet_name: str) -> set[str]:
        """Fetch existing profile IDs (column A) to check for duplicates."""
        token = get_access_token()
        url = f"{self.base_url}/{spreadsheet_id}/values/{sheet_name}"
        
        response = requests.get(url, headers=self._headers(token), timeout=30)
        existing_ids = set()
        
        if response.ok:
            data = response.json()
            rows = data.get("values", [])[1:]  # Skip header
            for row in rows:
                if row:
                    existing_ids.add(str(row[0]))
        
        return existing_ids

    def _headers(self, token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

