import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Job } from "./types.js";

export const searchJobsTool = createTool({
  id: "search-jobs",
  description: "Search for LinkedIn jobs by keywords and location",

  inputSchema: z.object({
    keywords: z.string().describe("Job search keywords (e.g., 'Software Engineer')"),
    count: z.number().max(25).default(5).describe("Number of jobs to return"),
    start: z.number().default(0).describe("Pagination offset"),
    locationId: z.string().optional().describe("Geographic location ID from search-geo-location"),
    datePosted: z.enum(["past-24-hours", "past-week", "past-month"]).default("past-week").describe("Date filter for job postings"),
  }),

  outputSchema: z.object({
    jobs: z.array(z.any()),
    total: z.number().optional(),
  }),

  execute: async ({ context }) => {
    const { keywords, count, start, locationId, datePosted } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/jobs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          count,
          start,
          filters: {
            datePosted,
            ...(locationId && { locationId }),
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to search LinkedIn jobs");
    }

    const data = (await res.json()) as { jobs?: Job[]; total?: number };
    return {
      jobs: (data.jobs || []) as Job[],
      total: data.total,
    };
  },
});