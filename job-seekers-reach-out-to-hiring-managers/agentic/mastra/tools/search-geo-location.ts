import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchGeoLocationTool = createTool({
  id: "search-geo-location",
  description: "Search for geographic locations to get location IDs for job searches",

  inputSchema: z.object({
    keywords: z.string().describe("Location keywords (e.g., 'Australia', 'New York')"),
  }),

  outputSchema: z.object({
    locations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      country: z.string().optional(),
    })),
  }),

  execute: async ({ context }) => {
    const { keywords } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/geo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to search geographic locations");
    }

    const data = (await res.json()) as { locations?: Array<{ id: string; name: string; country?: string }> };
    return {
      locations: data.locations || [],
    };
  },
});