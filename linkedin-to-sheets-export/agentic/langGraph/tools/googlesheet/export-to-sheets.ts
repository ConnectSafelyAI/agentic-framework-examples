/**
 * Google Sheets export tool for LinkedIn search results
 */

import { tool } from "@langchain/core/tools";
import type { Person } from "../types.js";
import { GoogleSheetsClient } from "./client.js";
import { exportToSheetsSchema, HEADERS } from "./schemas.js";

export const exportToSheetsTool = tool(
  async ({ people, spreadsheetId, spreadsheetTitle, sheetName }) => {
    const client = new GoogleSheetsClient();

    const now = new Date();
    const autoTitle = `LinkedIn People Export - ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)}`;

    const finalSpreadsheetTitle = spreadsheetTitle ?? autoTitle;

    let finalSpreadsheetId = spreadsheetId;
    let spreadsheetUrl: string;
    let isNewSheet = false;

    if (!finalSpreadsheetId) {
      const result = await client.createSpreadsheet(
        finalSpreadsheetTitle,
        sheetName,
        HEADERS
      );
      finalSpreadsheetId = result.spreadsheetId;
      spreadsheetUrl = result.spreadsheetUrl;
      isNewSheet = true;
    } else {
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${finalSpreadsheetId}`;
    }

    const existingProfileIds = await client.getExistingProfileIds(
      finalSpreadsheetId,
      sheetName
    );

    const timestamp = new Date().toISOString();
    const rows = people
      .filter((person: Person) => !existingProfileIds.has(person.profileId))
      .map((person: Person) => [
        person.profileId,
        person.profileUrl,
        person.fullName,
        person.firstName ?? "",
        person.lastName ?? "",
        person.headline,
        person.currentPosition ?? "",
        person.company,
        person.location,
        person.connectionDegree ?? "",
        person.isPremium ?? "",
        person.isOpenToWork ?? "",
        person.profilePicture ?? "",
        timestamp,
      ]);

    const peopleSkipped = people.length - rows.length;
    let peopleAdded = 0;

    if (rows.length > 0) {
      await client.appendRows(finalSpreadsheetId, sheetName, rows);
      peopleAdded = rows.length;
    }

    if (!finalSpreadsheetId) {
      throw new Error(
        "Spreadsheet ID is required but was not created or provided"
      );
    }

    return JSON.stringify({
      success: true,
      spreadsheetId: finalSpreadsheetId,
      spreadsheetUrl,
      spreadsheetTitle: finalSpreadsheetTitle,
      sheetName,
      peopleAdded,
      peopleSkipped,
      isNewSheet,
      summary: `${isNewSheet ? "Created" : "Updated"} spreadsheet "${finalSpreadsheetTitle}" with ${peopleAdded} new people${
        peopleSkipped > 0 ? ` (${peopleSkipped} duplicates skipped)` : ""
      }`,
    });
  },
  {
    name: "export-to-sheets",
    description:
      "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
    schema: exportToSheetsSchema,
  }
);
