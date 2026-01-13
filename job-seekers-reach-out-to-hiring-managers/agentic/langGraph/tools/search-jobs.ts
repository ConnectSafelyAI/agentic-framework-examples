import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const searchJobsTool = tool(
  async ({ keywords, count, start, locationId, datePosted }) => {
    const actualCount = count ?? 5;
    const actualStart = start ?? 0;
    const actualDatePosted = datePosted ?? "past-week";

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/jobs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          count: actualCount,
          start: actualStart,
          filters: {
            datePosted: actualDatePosted,
            ...(locationId && { locationId }),
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to search LinkedIn jobs: ${res.statusText}`);
    }

    const data = await res.json() as { jobs?: any[]; total?: number };
    
    return JSON.stringify({
      jobs: data.jobs || [],
      total: data.total,
    });
  },
  {
    name: "search-jobs",
    description: "Search for LinkedIn jobs by keywords and location. Returns job listings with company information.",
    schema: z.object({
      keywords: z.string().describe("Job search keywords (e.g., 'Software Engineer')"),
      count: z.number().optional().describe("Number of jobs to return (max 25, default: 5)"),
      start: z.number().optional().describe("Pagination offset (default: 0)"),
      locationId: z.string().optional().describe("Geographic location ID from search-geo-location"),
      datePosted: z.enum(["past-24-hours", "past-week", "past-month"]).optional().describe("Date filter for job postings (default: past-week)"),
    }),
  }
);