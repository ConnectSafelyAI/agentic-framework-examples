import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const searchGeoLocationTool = tool(
  async ({ keywords }) => {
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
      throw new Error(`Failed to search geographic locations: ${res.statusText}`);
    }

    const data = await res.json() as {
      locations?: Array<{ id: string; geoId?: string; name: string; country?: string }>
    };

    return JSON.stringify({
      success: true,
      locations: data.locations || [],
    });
  },
  {
    name: "search-geo-location",
    description: "Search for geographic locations to get location IDs for people searches. Use this first if user provides location name instead of location ID.",
    schema: z.object({
      keywords: z.string().describe("Location keywords (e.g., 'United States', 'San Francisco')"),
    }),
  }
);
