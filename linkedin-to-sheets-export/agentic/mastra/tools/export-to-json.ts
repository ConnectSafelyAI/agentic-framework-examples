import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
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

export const exportToJsonTool = createTool({
  id: "export-to-json",
  description: "Export LinkedIn search results to a JSON file.",
  inputSchema: z.object({
    people: z.array(personSchema).describe("Array of people to export"),
    outputDir: z.string().optional().describe("Output directory (default: current directory)"),
    filename: z.string().optional().describe("Custom filename (default: auto-generated with timestamp)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    filePath: z.string().optional(),
    recordsExported: z.number().optional(),
    fileSizeBytes: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { people, outputDir, filename } = context;

    const dir = outputDir || process.cwd();

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const finalFilename = filename || `linkedin-export-${timestamp}.json`;
    const filePath = path.join(dir, finalFilename.endsWith(".json") ? finalFilename : `${finalFilename}.json`);

    try {
      const exportTimestamp = new Date().toISOString();
      const exportData = {
        exportedAt: exportTimestamp,
        totalCount: people.length,
        people: people.map((person: Person) => ({
          profileUrl: person.profileUrl,
          profileId: person.profileId,
          profileUrn: person.profileUrn || "",
          fullName: person.fullName,
          firstName: person.firstName || "",
          lastName: person.lastName || "",
          headline: person.headline,
          currentPosition: person.currentPosition || "",
          company: person.company,
          location: person.location,
          connectionDegree: person.connectionDegree || "",
          isPremium: person.isPremium || false,
          isOpenToWork: person.isOpenToWork || false,
          profilePicture: person.profilePicture || "",
          extractedAt: exportTimestamp,
        })),
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");

      const stats = fs.statSync(filePath);

      return {
        success: true,
        filePath,
        recordsExported: people.length,
        fileSizeBytes: stats.size,
      };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
