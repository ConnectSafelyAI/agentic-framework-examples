"""Google Sheets API client for spreadsheet operations."""

import requests
from typing import List, Set, Dict, Any
from .auth import get_access_token


class GoogleSheetsClient:
    """Wrapper for Google Sheets API operations."""

    def __init__(self):
        self.base_url = "https://sheets.googleapis.com/v4/spreadsheets"

    def create_spreadsheet(
        self, title: str, sheet_name: str, headers: List[str]
    ) -> Dict[str, str]:
        """Create a new spreadsheet with headers."""
        token = get_access_token()

        response = requests.post(
            self.base_url,
            headers=self._headers(token),
            json={
                "properties": {"title": title},
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
        response.raise_for_status()
        data = response.json()

        result = {
            "id": data["spreadsheetId"],
            "url": data["spreadsheetUrl"],
            "title": title,
        }

        # Add header row
        self.append_data(result["id"], sheet_name, [headers])
        return result

    def get_existing_profile_ids(
        self, spreadsheet_id: str, sheet_name: str
    ) -> Set[str]:
        """Fetch existing profile IDs to check for duplicates."""
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

    def append_data(
        self, spreadsheet_id: str, sheet_name: str, values: List[List[Any]]
    ) -> bool:
        """Append rows to a sheet."""
        if not values:
            return False

        token = get_access_token()
        url = f"{self.base_url}/{spreadsheet_id}/values/{sheet_name}:append"

        response = requests.post(
            url,
            params={"valueInputOption": "USER_ENTERED"},
            headers=self._headers(token),
            json={"values": values},
            timeout=30,
        )
        response.raise_for_status()
        return True

    def _headers(self, token: str) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
