import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const searchHiringManagersTool = tool(
  async ({ companyId, jobTitle, managerTitle, count, connectionDegree }) => {
    const actualCount = count ?? 5;
    const actualConnectionDegree = connectionDegree ?? ["S", "O"];

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
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: searchTitle,
          count: actualCount,
          filters: {
            currentCompanyIds: [companyId],
            connectionDegree: actualConnectionDegree,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to search hiring managers: ${res.statusText}`);
    }

    const data = await res.json() as { people?: any[] };
    
    return JSON.stringify({
      people: data.people || [],
    });
  },
  {
    name: "search-hiring-managers",
    description: "Search for hiring managers or recruiters at a specific company. Automatically determines appropriate manager titles based on job title. Filters by company ID and connection degree.",
    schema: z.object({
      companyId: z.string().describe("Numeric company ID (not universal name)"),
      jobTitle: z.string().optional().describe("Job title to help determine appropriate manager titles"),
      managerTitle: z.string().optional().describe("Custom manager title keywords (e.g., 'Engineering Manager OR VP Engineering')"),
      count: z.number().optional().describe("Number of people to return (max 25, default: 5)"),
      connectionDegree: z.array(z.enum(["S", "O"])).optional().describe("Connection degree filter: S=2nd degree, O=3rd+ degree (default: ['S', 'O'])"),
    }),
  }
);