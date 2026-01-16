import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as fs from "fs";
import type { Person } from "./types.js";

const personSchema = z.object({
  profileUrl: z.string(),
  profileId: z.string(),
  profileUrn: z.string().optional(),
  fullName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  headline: z.string(),
  currentPosition: z.string().optional(),
  company: z.string(),
  location: z.string(),
  connectionDegree: z.string().optional(),
  isPremium: z.boolean().optional(),
  isOpenToWork: z.boolean().optional(),
  profilePicture: z.string().optional(),
});

export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description: "Export LinkedIn search results to Google Sheets. Requires Google Sheets API credentials.",
  inputSchema: z.object({
    people: z.array(personSchema).describe("Array of people to export"),
    spreadsheetId: z.string().optional().describe("Google Sheets spreadsheet ID (uses env var if not provided)"),
    sheetName: z.string().default("Sheet1").describe("Name of the sheet/tab"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    rowsExported: z.number().optional(),
    spreadsheetUrl: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { people, spreadsheetId, sheetName } = context;

    // Load Google credentials
    const credsFile = process.env.GOOGLE_SHEETS_CREDENTIALS_FILE;
    if (!credsFile) {
      return {
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS_FILE environment variable not set",
      };
    }

    if (!fs.existsSync(credsFile)) {
      return {
        success: false,
        error: `Credentials file not found: ${credsFile}`,
      };
    }

    const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!sheetId) {
      return {
        success: false,
        error: "Spreadsheet ID not provided and GOOGLE_SHEETS_SPREADSHEET_ID not set",
      };
    }

    try {
      // Dynamic import
      const { google } = await import("googleapis");
      const { GoogleAuth } = await import("google-auth-library");

      const auth = new GoogleAuth({
        keyFile: credsFile,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive",
        ],
      });

      const sheets = google.sheets({ version: "v4", auth });

      // Define headers
      const headers = [
        "profileUrl", "fullName", "firstName", "lastName",
        "headline", "currentPosition", "company", "location",
        "connectionDegree", "isPremium", "isOpenToWork",
        "profilePicture", "profileId", "extractedAt"
      ];

      // Check if headers exist
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName || "Sheet1"}!A1:N1`,
      });

      if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
        // Add headers
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName || "Sheet1"}!A1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [headers],
          },
        });
      }

      // Prepare data rows
      const timestamp = new Date().toISOString();
      const rows = people.map((person: Person) => [
        person.profileUrl,
        person.fullName,
        person.firstName || "",
        person.lastName || "",
        person.headline,
        person.currentPosition || "",
        person.company,
        person.location,
        person.connectionDegree || "",
        String(person.isPremium || false),
        String(person.isOpenToWork || false),
        person.profilePicture || "",
        person.profileId,
        timestamp,
      ]);

      // Append data
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName || "Sheet1"}!A2`,
        valueInputOption: "RAW",
        requestBody: {
          values: rows,
        },
      });

      return {
        success: true,
        rowsExported: rows.length,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
