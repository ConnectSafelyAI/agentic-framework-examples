/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Get Google OAuth access token from refresh token
 */
async function getAccessToken() {
  // Check for required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      "Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in environment variables."
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorData: any;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      // If parsing fails, use the text
    }
    throw new Error(
      `Failed to refresh Google access token: ${errorData?.error?.message || errorText || "Unknown error"}`
    );
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Google Sheets Tool for LangGraph
 * Creates or updates a Google Sheet with LinkedIn member data
 * Automatically handles OAuth token refresh and duplicate detection
 */
export const googleSheetsTool = tool(
  async ({ members, spreadsheetTitle, spreadsheetId, sheetName }) => {
    // Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Failed to obtain Google access token");
    }

    // Auto-generate spreadsheet title if missing
    const now = new Date();
    const autoTitle = `LinkedIn Premium Members - ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)}`;

    const finalSpreadsheetTitle = spreadsheetTitle ?? autoTitle;
    const finalSheetName = sheetName ?? "LinkedIn Members";

    const headers = [
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
    ];

    let finalSpreadsheetId = spreadsheetId;
    let spreadsheetUrl: string;
    let isNewSheet = false;

    // ---------------------------------------------------------------------
    // Create spreadsheet if needed
    // ---------------------------------------------------------------------
    if (!finalSpreadsheetId) {
      const createRes = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: { title: finalSpreadsheetTitle },
            sheets: [
              {
                properties: {
                  title: finalSheetName,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            ],
          }),
        }
      );

      if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create spreadsheet: ${err}`);
      }

      const data = (await createRes.json()) as { spreadsheetId: string; spreadsheetUrl: string };
      finalSpreadsheetId = data.spreadsheetId;
      spreadsheetUrl = data.spreadsheetUrl;
      isNewSheet = true;

      // Add header row
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${finalSpreadsheetId}/values/${finalSheetName}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: [headers] }),
        }
      );
    } else {
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${finalSpreadsheetId}`;
    }

    // ---------------------------------------------------------------------
    // Read existing rows (duplicate detection)
    // ---------------------------------------------------------------------
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${finalSpreadsheetId}/values/${finalSheetName}`,
      {
        headers: { Authorization: `Bearer ${accessToken.trim()}` },
      }
    );

    if (!readRes.ok) {
      throw new Error("Failed to read spreadsheet");
    }

    const sheetData = (await readRes.json()) as { values?: any[][] };
    const sheetValues = sheetData.values || [];
    const existingProfileIds = new Set<string>();

    sheetValues.slice(1).forEach((row: any[]) => {
      if (row?.[0]) existingProfileIds.add(String(row[0]));
    });

    // ---------------------------------------------------------------------
    // Prepare rows
    // ---------------------------------------------------------------------
    const rows = members
      .filter((m: any) => !existingProfileIds.has(m.profileId))
      .map((m: any) => [
        m.profileId ?? "",
        m.firstName ?? "",
        m.lastName ?? "",
        m.fullName ?? "",
        m.headline ?? "",
        m.publicIdentifier ?? "",
        m.profileUrl ?? "",
        m.followerCount ?? "",
        m.isPremium ?? "",
        m.isVerified ?? "",
        (m.badges ?? []).join(", "),
        m.relationshipStatus ?? "",
      ]);

    const membersSkipped = members.length - rows.length;
    let membersAdded = 0;

    // ---------------------------------------------------------------------
    // Append rows
    // ---------------------------------------------------------------------
    if (rows.length > 0) {
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${finalSpreadsheetId}/values/${finalSheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: rows }),
        }
      );

      if (!appendRes.ok) {
        throw new Error("Failed to append rows");
      }

      membersAdded = rows.length;
    }

    // ---------------------------------------------------------------------
    // Return result as JSON string (LangGraph requirement)
    // ---------------------------------------------------------------------
    if (!finalSpreadsheetId) {
      throw new Error("Spreadsheet ID is required but was not created or provided");
    }

    const result = {
      success: true,
      spreadsheetId: finalSpreadsheetId,
      spreadsheetUrl,
      spreadsheetTitle: finalSpreadsheetTitle,
      sheetName: finalSheetName,
      membersAdded,
      membersSkipped,
      isNewSheet,
      summary: `${isNewSheet ? "Created" : "Updated"} spreadsheet "${finalSpreadsheetTitle}" with ${membersAdded} new members${
        membersSkipped > 0 ? ` (${membersSkipped} duplicates skipped)` : ""
      }`,
    };

    return JSON.stringify(result);
  },
  {
    name: "google-sheets",
    description:
      "Create or update a Google Sheet with LinkedIn group members. Automatically handles OAuth token refresh and skips duplicates by Profile ID. Access token is automatically retrieved - no user input needed.",
    schema: z.object({
      members: z.array(z.record(z.any())).describe("Array of LinkedIn member objects to write to the sheet"),
      spreadsheetTitle: z
        .string()
        .optional()
        .describe("Optional title for new spreadsheet (auto-generated if not provided)"),
      spreadsheetId: z
        .string()
        .optional()
        .describe("Existing spreadsheet ID to update (creates new if not provided)"),
      sheetName: z
        .string()
        .optional()
        .describe("Sheet name within the spreadsheet (defaults to 'LinkedIn Members')"),
    }),
  }
);
