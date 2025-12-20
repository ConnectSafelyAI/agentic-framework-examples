/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { LinkedInMember } from "./index";

export const fetchAllLinkedInGroupMembersTool = createTool({
  id: "fetch-all-linkedin-group-members",
  description: "Fetch all LinkedIn group members with auto pagination",

  inputSchema: z.object({
    groupId: z.string(),
    maxMembers: z.number().optional(),
  }),

  outputSchema: z.object({
    totalFetched: z.number(),
    members: z.array(z.any()),
  }),

  execute: async ({ context }) => {
    let start = 0;
    const count = 50;
    let hasMore = true;

    const allMembers: LinkedInMember[] = [];

    while (hasMore) {
      const res = await fetch(
        "https://api.connectsafely.ai/linkedin/groups/members",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: context.groupId,
            start,
            count,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Pagination fetch failed");
      }

      const data = await res.json();

      const batch = (data.members || []).map((m: any) => ({
        ...m,
        fetchedAt: new Date().toISOString(),
      }));

      allMembers.push(...batch);

      hasMore = Boolean(data.hasMore);
      start += count;

      if (context.maxMembers && allMembers.length >= context.maxMembers) {
        break;
      }
    }

    return {
      totalFetched: allMembers.length,
      members: context.maxMembers
        ? allMembers.slice(0, context.maxMembers)
        : allMembers,
    };
  },
});
