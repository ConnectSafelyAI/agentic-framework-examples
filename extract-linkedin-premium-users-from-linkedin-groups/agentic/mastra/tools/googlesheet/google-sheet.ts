/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh Google access token");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}


export const googleSheetsTool = createTool({
  id: "google-sheets-members",
  description:
    "Create or update a Google Sheet with LinkedIn group members. Automatically skips duplicates by Profile ID.",

  inputSchema: z.object({
    accessToken: z
      .string()
      .optional()
      .describe("Google OAuth token (overrides env)"),

    spreadsheetId: z
      .string()
      .optional()
      .describe("Existing spreadsheet ID"),

    spreadsheetTitle: z
      .string()
      .optional()
      .describe("Optional title for new spreadsheet"),

    sheetName: z
      .string()
      .default("LinkedIn Members"),

    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fullName: z.string().optional(),
        headline: z.string().optional(),
        publicIdentifier: z.string().optional(),
        profileUrl: z.string().optional(),
        followerCount: z.number().optional(),
        isPremium: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        badges: z.array(z.string()).optional(),
        relationshipStatus: z.string().optional(),
      })
    ),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    spreadsheetId: z.string(),
    spreadsheetUrl: z.string(),
    spreadsheetTitle: z.string(),
    sheetName: z.string(),
    membersAdded: z.number(),
    membersSkipped: z.number(),
    isNewSheet: z.boolean(),
    summary: z.string(),
  }),

  execute: async ({ context }) => {
    // ---------------------------------------------------------------------
    // Access token resolution (CORRECT)
    // ---------------------------------------------------------------------
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Google access token is required. Please ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set in environment variables.");
    }

    // ---------------------------------------------------------------------
    // Auto-generate spreadsheet title if missing
    // ---------------------------------------------------------------------
    const now = new Date();
    const autoTitle = `LinkedIn Premium Members - ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)}`;

    const spreadsheetTitle =
      context.spreadsheetTitle ?? autoTitle;

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

    let spreadsheetId = context.spreadsheetId;
    let spreadsheetUrl: string;
    let isNewSheet = false;

    // ---------------------------------------------------------------------
    // Create spreadsheet if needed
    // ---------------------------------------------------------------------
    if (!spreadsheetId) {
      const createRes = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: { title: spreadsheetTitle },
            sheets: [
              {
                properties: {
                  title: context.sheetName,
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
      spreadsheetId = data.spreadsheetId;
      spreadsheetUrl = data.spreadsheetUrl;
      isNewSheet = true;

      // Add header row
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}!A1:append?valueInputOption=USER_ENTERED`,
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
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }

    // ---------------------------------------------------------------------
    // Read existing rows (duplicate detection)
    // ---------------------------------------------------------------------
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}`,
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
    const rows = context.members
      .filter((m) => !existingProfileIds.has(m.profileId))
      .map((m) => [
        m.profileId,
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

    const membersSkipped = context.members.length - rows.length;
    let membersAdded = 0;

    // ---------------------------------------------------------------------
    // Append rows
    // ---------------------------------------------------------------------
    if (rows.length > 0) {
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
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
    // Final response
    // ---------------------------------------------------------------------
    if (!spreadsheetId) {
      throw new Error("Spreadsheet ID is required but was not created or provided");
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      spreadsheetTitle,
      sheetName: context.sheetName,
      membersAdded,
      membersSkipped,
      isNewSheet,
      summary: `${isNewSheet ? "Created" : "Updated"} spreadsheet "${spreadsheetTitle}" with ${membersAdded} new members${
        membersSkipped > 0 ? ` (${membersSkipped} duplicates skipped)` : ""
      }`,
    };
  },
});
