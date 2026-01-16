import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
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

export const exportToJsonTool = tool(
  async ({ people, outputDir, filename }) => {
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
          profileUrn: person.profileUrn,
          fullName: person.fullName,
          firstName: person.firstName,
          lastName: person.lastName,
          headline: person.headline,
          currentPosition: person.currentPosition,
          company: person.company,
          location: person.location,
          connectionDegree: person.connectionDegree,
          isPremium: person.isPremium,
          isOpenToWork: person.isOpenToWork,
          profilePicture: person.profilePicture,
          extractedAt: exportTimestamp,
        })),
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");

      const stats = fs.statSync(filePath);

      return JSON.stringify({
        success: true,
        filePath,
        filename: path.basename(filePath),
        recordsExported: people.length,
        fileSizeBytes: stats.size,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
  {
    name: "export-to-json",
    description: "Export LinkedIn search results to a JSON file.",
    schema: z.object({
      people: z.array(personSchema).describe("Array of people to export"),
      outputDir: z.string().optional().describe("Output directory (default: current directory)"),
      filename: z.string().optional().describe("Custom filename (default: auto-generated with timestamp)"),
    }),
  }
);
