import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { GroupMembersResponse } from "./types";

// ============================================================================
// TOOL: FETCH LINKEDIN GROUP MEMBERS (with pagination)
// ============================================================================
// Fetches a single page of members from a LinkedIn group with manual pagination support.
// Use this tool when you need fine-grained control over pagination or want to fetch a specific subset of members.

export const fetchLinkedInPremiumGroupMembersTool = createTool({
  id: "fetch-linkedin-group-members",
  description:
    "Fetch members from a LinkedIn group with pagination support. Retrieves member profiles including premium/verified status, headlines, and relationship information.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe('LinkedIn group ID (e.g., "9357376")'),
    count: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Number of members per request (max 100)"),
    start: z
      .number()
      .min(0)
      .default(0)
      .describe("Pagination offset - starting position"),
  }),
  outputSchema: z.object({
    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
        publicIdentifier: z.string(),
        profileUrl: z.string(),
        followerCount: z.number(),
        isPremium: z.boolean(),
        isVerified: z.boolean(),
        badges: z.array(z.string()),
        relationshipStatus: z.string(),
        creator: z.boolean(),
      })
    ),
    hasMore: z.boolean(),
    fetchedCount: z.number(),
  }),
  execute: async ({ context }) => {
    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: context.groupId,
          count: context.count,
          start: context.start,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    const data = (await response.json()) as GroupMembersResponse;

    return {
      members: data.members,
      hasMore: data.hasMore,
      fetchedCount: data.members.length,
    };
  },
});
