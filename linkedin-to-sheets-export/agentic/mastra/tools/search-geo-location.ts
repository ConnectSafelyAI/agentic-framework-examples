import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const searchGeoLocationTool = createTool({
  id: "search-geo-location",
  description: "Search for geographic locations to get location IDs for people searches. Use this first if user provides location name instead of location ID.",
  inputSchema: z.object({
    keywords: z.string().describe("Location keywords (e.g., 'United States', 'San Francisco')"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    locations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      country: z.string().optional(),
    })).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { keywords } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/geo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords }),
      }
    );

    if (!res.ok) {
      return {
        success: false,
        error: `Failed to search geographic locations: ${res.statusText}`,
      };
    }

    const data = await res.json() as {
      locations?: Array<{ id: string; geoId?: string; name: string; country?: string }>
    };

    return {
      success: true,
      locations: (data.locations || []).map(loc => ({
        id: loc.geoId || loc.id,
        name: loc.name,
        country: loc.country,
      })),
    };
  },
});
