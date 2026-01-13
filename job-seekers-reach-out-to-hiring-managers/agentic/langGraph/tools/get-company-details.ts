import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const getCompanyDetailsTool = tool(
  async ({ companyId }) => {
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/companies/details",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to get company details: ${res.statusText}`);
    }

    const data = await res.json() as { company?: any };
    
    return JSON.stringify({
      company: data.company || {},
    });
  },
  {
    name: "get-company-details",
    description: "Get detailed information about a company by company ID or universal name.",
    schema: z.object({
      companyId: z.string().describe("Company ID or universal name"),
    }),
  }
);