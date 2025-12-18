/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const googleSheetsTool = createTool({
  id: "google-sheets-members",
  description:
    "Unified tool for managing LinkedIn group members in Google Sheets. Can create a new spreadsheet with members or add members to an existing spreadsheet. Automatically handles duplicate detection by Profile ID. Google access token can be provided directly or via GOOGLE_ACCESS_TOKEN environment variable.",
  inputSchema: z.object({
    // Google Sheets Configuration
    accessToken: z
      .string()
      .optional()
      .describe(
        "Google OAuth2 access token (optional if GOOGLE_ACCESS_TOKEN env var is set)"
      ),

    // For existing sheets: provide spreadsheetId
    // For new sheets: provide spreadsheetTitle (spreadsheetId is optional)
    spreadsheetId: z
      .string()
      .optional()
      .describe(
        "Google Sheets spreadsheet ID (if adding to existing sheet). If not provided, a new spreadsheet will be created."
      ),
    spreadsheetTitle: z
      .string()
      .optional()
      .describe(
        'Title for new spreadsheet (required only when creating a new sheet, e.g., "LinkedIn Premium Members - 2024")'
      ),
    sheetName: z
      .string()
      .default("LinkedIn Members")
      .describe("Name of the sheet/tab within the spreadsheet"),

    // Member data
    members: z
      .array(
        z.object({
          profileId: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          fullName: z.string(),
          headline: z.string(),
          publicIdentifier: z.string(),
          profileUrl: z.string(),
          followerCount: z.number(),
          isPremium: z.boolean(),
          isVerified: z.boolean(),
          badges: z.string(),
          relationshipStatus: z.string(),
        })
      )
      .describe("Array of LinkedIn members to add"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    spreadsheetId: z.string(),
    spreadsheetUrl: z.string(),
    sheetName: z.string(),
    membersAdded: z.number(),
    membersSkipped: z.number(),
    isNewSheet: z.boolean(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // ========================================================================
    // Get access token from context or environment variable
    // ========================================================================
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN || context.accessToken;

    if (!accessToken) {
      throw new Error(
        "Google access token is required. Provide it either as 'accessToken' parameter or set GOOGLE_ACCESS_TOKEN environment variable."
      );
    }

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

    let spreadsheetId: string;
    let spreadsheetUrl: string;
    let sheetId: number | undefined;
    let isNewSheet = false;

    // ========================================================================
    // STEP 1: Create new spreadsheet OR use existing one
    // ========================================================================
    if (!context.spreadsheetId) {
      // Create new spreadsheet
      if (!context.spreadsheetTitle) {
        throw new Error(
          "spreadsheetTitle is required when creating a new spreadsheet"
        );
      }

      const createResponse = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              title: context.spreadsheetTitle,
            },
            sheets: [
              {
                properties: {
                  title: context.sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 12,
                    frozenRowCount: 1,
                  },
                },
              },
            ],
          }),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(
          `Failed to create spreadsheet: ${createResponse.statusText} - ${errorText}`
        );
      }

      const spreadsheetData = await createResponse.json();
      spreadsheetId = spreadsheetData.spreadsheetId;
      sheetId = spreadsheetData.sheets[0].properties.sheetId;
      spreadsheetUrl = spreadsheetData.spreadsheetUrl;
      isNewSheet = true;

      // Add headers to new sheet
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [headers],
          }),
        }
      );

      // Format header row (bold, blue background, white text)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 0.2,
                        green: 0.5,
                        blue: 0.9,
                      },
                      textFormat: {
                        bold: true,
                        foregroundColor: {
                          red: 1,
                          green: 1,
                          blue: 1,
                        },
                      },
                    },
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat)",
                },
              },
            ],
          }),
        }
      );
    } else {
      // Use existing spreadsheet
      spreadsheetId = context.spreadsheetId;
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      // Verify the sheet exists and get existing data for duplicate detection
      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!getResponse.ok) {
        throw new Error(
          `Failed to access spreadsheet: ${getResponse.statusText}. Make sure the spreadsheet ID and sheet name are correct.`
        );
      }
    }

    // ========================================================================
    // STEP 2: Check for existing members (duplicate detection)
    // ========================================================================
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to read sheet: ${getResponse.statusText}`);
    }

    const sheetData = await getResponse.json();
    const existingRows = sheetData.values || [];

    // Create set of existing Profile IDs (skip header row)
    const existingProfileIds = new Set<string>();
    if (existingRows.length > 0) {
      // Find Profile ID column (usually first column, index 0)
      existingRows.slice(1).forEach((row: string[]) => {
        if (row[0]) {
          existingProfileIds.add(String(row[0]));
        }
      });
    }

    // ========================================================================
    // STEP 3: Filter out duplicates and prepare member rows
    // ========================================================================
    const memberRows = context.members
      .filter((member) => !existingProfileIds.has(member.profileId))
      .map((member) => [
        member.profileId,
        member.firstName,
        member.lastName,
        member.fullName,
        member.headline,
        member.publicIdentifier,
        member.profileUrl,
        member.followerCount,
        member.isPremium,
        member.isVerified,
        member.badges,
        member.relationshipStatus,
      ]);

    const membersSkipped = context.members.length - memberRows.length;
    let membersAdded = 0;

    // ========================================================================
    // STEP 4: Add member data (if any new members)
    // ========================================================================
    if (memberRows.length > 0) {
      const addDataResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: memberRows,
          }),
        }
      );

      if (!addDataResponse.ok) {
        throw new Error(
          `Failed to add member data: ${addDataResponse.statusText}`
        );
      }

      membersAdded = memberRows.length;
    }

    // ========================================================================
    // STEP 5: Generate summary
    // ========================================================================
    const action = isNewSheet ? "Created" : "Updated";
    const summary = `${action} spreadsheet "${context.spreadsheetTitle || spreadsheetId}" with ${membersAdded} new LinkedIn group members${membersSkipped > 0 ? ` (${membersSkipped} duplicates skipped)` : ""}`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      sheetName: context.sheetName,
      membersAdded,
      membersSkipped,
      isNewSheet,
      summary,
    };
  },
});
