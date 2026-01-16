import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from "fs";
import type { Person } from "./types.js";

const personSchema = z.object({
  profileUrl: z.string(),
  profileId: z.string(),
  profileUrn: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  headline: z.string(),
  currentPosition: z.string(),
  company: z.string(),
  location: z.string(),
  connectionDegree: z.string(),
  isPremium: z.boolean(),
  isOpenToWork: z.boolean(),
  profilePicture: z.string(),
});

export const exportToSheetsTool = tool(
  async ({ people, spreadsheetId, sheetName }) => {
    // Load Google credentials
    const credsFile = process.env.GOOGLE_SHEETS_CREDENTIALS_FILE;
    if (!credsFile) {
      return JSON.stringify({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS_FILE environment variable not set",
      });
    }

    if (!fs.existsSync(credsFile)) {
      return JSON.stringify({
        success: false,
        error: `Credentials file not found: ${credsFile}`,
      });
    }

    const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!sheetId) {
      return JSON.stringify({
        success: false,
        error: "Spreadsheet ID not provided and GOOGLE_SHEETS_SPREADSHEET_ID not set",
      });
    }

    try {
      // Dynamic import to handle optional dependency
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
        range: `${sheetName}!A1:N1`,
      });

      if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
        // Add headers
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName}!A1`,
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
        person.firstName,
        person.lastName,
        person.headline,
        person.currentPosition,
        person.company,
        person.location,
        person.connectionDegree,
        String(person.isPremium),
        String(person.isOpenToWork),
        person.profilePicture,
        person.profileId,
        timestamp,
      ]);

      // Append data
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A2`,
        valueInputOption: "RAW",
        requestBody: {
          values: rows,
        },
      });

      return JSON.stringify({
        success: true,
        rowsExported: rows.length,
        spreadsheetId: sheetId,
        sheetName,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
  {
    name: "export-to-sheets",
    description: "Export LinkedIn search results to Google Sheets. Requires Google Sheets API credentials.",
    schema: z.object({
      people: z.array(personSchema).describe("Array of people to export"),
      spreadsheetId: z.string().optional().describe("Google Sheets spreadsheet ID (uses env var if not provided)"),
      sheetName: z.string().default("Sheet1").describe("Name of the sheet/tab"),
    }),
  }
);
