/**
 * Zod schemas for Google Sheets export
 */

import { z } from "zod";

export const personSchema = z.object({
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

export const inputSchema = z.object({
  people: z.array(personSchema).describe("Array of people to export"),
  spreadsheetId: z
    .string()
    .optional()
    .describe("Existing spreadsheet ID (creates new if not provided)"),
  spreadsheetTitle: z.string().optional().describe("Title for new spreadsheet"),
  sheetName: z
    .string()
    .default("LinkedIn People")
    .describe("Name of the sheet/tab"),
});

export const outputSchema = z.object({
  success: z.boolean(),
  spreadsheetId: z.string(),
  spreadsheetUrl: z.string(),
  spreadsheetTitle: z.string(),
  sheetName: z.string(),
  peopleAdded: z.number(),
  peopleSkipped: z.number(),
  isNewSheet: z.boolean(),
  summary: z.string(),
});

export const HEADERS = [
  "Profile ID",
  "Profile URL",
  "Full Name",
  "First Name",
  "Last Name",
  "Headline",
  "Current Position",
  "Company",
  "Location",
  "Connection Degree",
  "Is Premium",
  "Is Open To Work",
  "Profile Picture",
  "Extracted At",
];
