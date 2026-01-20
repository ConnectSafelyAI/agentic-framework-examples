"""Google OAuth authentication utilities."""

import os
import requests


def get_access_token() -> str:
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
