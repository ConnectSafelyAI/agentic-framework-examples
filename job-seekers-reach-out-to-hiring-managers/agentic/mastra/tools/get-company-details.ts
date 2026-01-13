import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Company } from "./types.js";

export const getCompanyDetailsTool = createTool({
  id: "get-company-details",
  description: "Get detailed information about a company by company ID or universal name",

  inputSchema: z.object({
    companyId: z.string().describe("Company ID or universal name"),
  }),

  outputSchema: z.object({
    company: z.any(),
  }),

  execute: async ({ context }) => {
    const { companyId } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/companies/details",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to get company details");
    }

    const data = (await res.json()) as { company?: Company };
    return {
      company: (data.company || {}) as Company,
    };
  },
});