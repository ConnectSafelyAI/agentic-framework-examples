import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Profile } from "./types.js";

export const fetchProfileDetailsTool = createTool({
  id: "fetch-profile-details",
  description: "Fetch detailed profile information for a LinkedIn user by profile ID (vanity name)",

  inputSchema: z.object({
    profileId: z.string().describe("Profile ID (vanity name from publicIdentifier or profileUrl)"),
  }),

  outputSchema: z.object({
    profile: z.any(),
  }),

  execute: async ({ context }) => {
    const { profileId } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/profile",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch profile details");
    }

    const data = (await res.json()) as { profile?: Profile };
    return {
      profile: (data.profile || {}) as Profile,
    };
  },
});