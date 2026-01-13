import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const fetchProfileDetailsTool = tool(
  async ({ profileId }) => {
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/profile",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch profile details: ${res.statusText}`);
    }

    const data = await res.json() as { profile?: any };
    
    return JSON.stringify({
      profile: data.profile || {},
    });
  },
  {
    name: "fetch-profile-details",
    description: "Fetch detailed profile information for a LinkedIn user by profile ID (vanity name from publicIdentifier or profileUrl).",
    schema: z.object({
      profileId: z.string().describe("Profile ID (vanity name from publicIdentifier or profileUrl)"),
    }),
  }
);