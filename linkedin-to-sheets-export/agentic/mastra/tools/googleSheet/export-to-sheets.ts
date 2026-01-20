/**
 * Google Sheets export tool for LinkedIn search results
 */

import { createTool } from "@mastra/core/tools";
import type { Person } from "../types.js";
import { GoogleSheetsClient } from "./googleSheetsClient.js";
import { inputSchema, outputSchema, HEADERS } from "./schemas.js";

export const exportToSheetsTool = createTool({
  id: "export-to-sheets",
  description:
    "Export LinkedIn search results to Google Sheets. Automatically creates or updates spreadsheet with duplicate detection by Profile ID.",
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const client = new GoogleSheetsClient();

    const now = new Date();
    const autoTitle = `LinkedIn People Export - ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)}`;

    const spreadsheetTitle = context.spreadsheetTitle ?? autoTitle;

    let spreadsheetId = context.spreadsheetId;
    let spreadsheetUrl: string;
    let isNewSheet = false;

    if (!spreadsheetId) {
      const result = await client.createSpreadsheet(
        spreadsheetTitle,
        context.sheetName,
        HEADERS
      );
      spreadsheetId = result.spreadsheetId;
      spreadsheetUrl = result.spreadsheetUrl;
      isNewSheet = true;
    } else {
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }

    const existingProfileIds = await client.getExistingProfileIds(
      spreadsheetId,
      context.sheetName
    );

    const timestamp = new Date().toISOString();
    const rows = context.people
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

    const peopleSkipped = context.people.length - rows.length;
    let peopleAdded = 0;

    if (rows.length > 0) {
      await client.appendRows(spreadsheetId, context.sheetName, rows);
      peopleAdded = rows.length;
    }

    if (!spreadsheetId) {
      throw new Error(
        "Spreadsheet ID is required but was not created or provided"
      );
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      spreadsheetTitle,
      sheetName: context.sheetName,
      peopleAdded,
      peopleSkipped,
      isNewSheet,
      summary: `${isNewSheet ? "Created" : "Updated"} spreadsheet "${spreadsheetTitle}" with ${peopleAdded} new people${
        peopleSkipped > 0 ? ` (${peopleSkipped} duplicates skipped)` : ""
      }`,
    };
  },
});

