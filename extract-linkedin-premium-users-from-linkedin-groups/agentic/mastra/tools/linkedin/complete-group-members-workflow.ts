/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const completeGroupMembersWorkflowTool = createTool({
  id: "complete-group-members-workflow",
  description:
    "End-to-end workflow to fetch all LinkedIn group members and return only Premium or Verified profiles",

  inputSchema: z.object({
    groupId: z.string().describe("LinkedIn group ID"),
    maxMembers: z
      .number()
      .optional()
      .describe("Optional limit on number of members to fetch"),
  }),

  outputSchema: z.object({
    groupId: z.string(),
    totalFetched: z.number(),
    totalPremiumVerified: z.number(),
    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fullName: z.string().optional(),
        headline: z.string().optional(),
        publicIdentifier: z.string().optional(),
        profileUrl: z.string().optional(),
        followerCount: z.number().optional(),
        isPremium: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        badges: z.array(z.string()).optional(),
        relationshipStatus: z.string().optional(),
        creator: z.boolean().optional(),
        fetchedAt: z.string().optional(),
      })
    ),
  }),

  execute: async ({ context }) => {
    const { groupId, maxMembers } = context;

    let start = 0;
    const count = 50;
    let hasMore = true;

    const allMembers: any[] = [];

    while (hasMore) {
      const res = await fetch(
        "https://api.connectsafely.ai/linkedin/groups/members",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupId, start, count }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch LinkedIn group members");
      }

      const data = await res.json();
      const members = data.members || [];

      for (const member of members) {
        const badges = member.badges || [];

        const isPremiumOrVerified =
          member.isPremium === true ||
          member.isVerified === true ||
          badges.includes("premium") ||
          badges.includes("verified");

        if (isPremiumOrVerified) {
          allMembers.push({
            ...member,
            fetchedAt: new Date().toISOString(),
          });
        }
      }

      hasMore = Boolean(data.hasMore);
      start += count;

      if (maxMembers && allMembers.length >= maxMembers) {
        break;
      }
    }

    const finalMembers = maxMembers
      ? allMembers.slice(0, maxMembers)
      : allMembers;

    return {
      groupId,
      totalFetched: finalMembers.length,
      totalPremiumVerified: finalMembers.length,
      members: finalMembers,
    };
  },
});
