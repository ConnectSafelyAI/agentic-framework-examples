import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { GroupMember, GroupMembersResponse } from "./types";

// ============================================================================
// TOOL: FETCH ALL LINKEDIN GROUP MEMBERS (automatic pagination)
// ============================================================================
// Automatically fetches ALL members from a LinkedIn group by handling pagination internally.
// Continues fetching until all members are retrieved or a maximum limit is reached.

export const fetchAllLinkedInGroupMembersTool = createTool({
  id: "fetch-all-linkedin-group-members",
  description:
    "Fetch ALL members from a LinkedIn group by automatically handling pagination. Will continue fetching until all members are retrieved.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe("LinkedIn group ID"),
    batchSize: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Members per API request"),
    maxMembers: z
      .number()
      .optional()
      .describe("Maximum members to fetch (optional limit)"),
  }),
  outputSchema: z.object({
    allMembers: z.array(
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
    totalFetched: z.number(),
    requestsMade: z.number(),
  }),
  execute: async ({ context }) => {
    const allMembers: GroupMember[] = [];
    let start = 0;
    let hasMore = true;
    let requestsMade = 0;

    while (hasMore) {
      // Check if we've hit the max limit
      if (context.maxMembers && allMembers.length >= context.maxMembers) {
        break;
      }

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
            count: context.batchSize,
            start: start,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch group members: ${response.statusText}`
        );
      }

      const data = (await response.json()) as GroupMembersResponse;
      allMembers.push(...data.members);
      hasMore = data.hasMore;
      start += context.batchSize;
      requestsMade++;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return {
      allMembers,
      totalFetched: allMembers.length,
      requestsMade,
    };
  },
});

