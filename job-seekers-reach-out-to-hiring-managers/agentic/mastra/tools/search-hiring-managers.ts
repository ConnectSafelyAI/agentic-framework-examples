import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Person } from "./types.js";

export const searchHiringManagersTool = createTool({
  id: "search-hiring-managers",
  description: "Search for hiring managers or recruiters at a specific company",

  inputSchema: z.object({
    companyId: z.string().describe("Numeric company ID (not universal name)"),
    jobTitle: z.string().optional().describe("Job title to help determine appropriate manager titles"),
    managerTitle: z.string().optional().describe("Custom manager title keywords (e.g., 'Engineering Manager OR VP Engineering')"),
    count: z.number().max(25).default(5).describe("Number of people to return"),
    connectionDegree: z.array(z.enum(["S", "O"])).default(["S", "O"]).describe("Connection degree filter: S=2nd degree, O=3rd+ degree"),
  }),

  outputSchema: z.object({
    people: z.array(z.any()),
  }),

  execute: async ({ context }) => {
    const { companyId, jobTitle, managerTitle, count, connectionDegree } = context;

    // Determine manager title based on job title if not provided
    let searchTitle = managerTitle || "Hiring Manager OR Recruiter";
    if (jobTitle && !managerTitle) {
      const lowerTitle = jobTitle.toLowerCase();
      if (lowerTitle.includes("engineer")) {
        searchTitle = "Engineering Manager OR VP Engineering OR CTO";
      } else if (lowerTitle.includes("sales")) {
        searchTitle = "Sales Director OR VP Sales";
      } else if (lowerTitle.includes("marketing")) {
        searchTitle = "Marketing Director OR CMO";
      }
    }

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: searchTitle,
          count,
          filters: {
            currentCompanyIds: [companyId],
            connectionDegree,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to search hiring managers");
    }

    const data = (await res.json()) as { people?: Person[] };
    return {
      people: (data.people || []) as Person[],
    };
  },
});