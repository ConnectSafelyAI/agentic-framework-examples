/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { LinkedInMember } from "./types.js";

export const fetchLinkedInGroupMembersTool = createTool({
  id: "fetch-linkedin-group-members",
  description: "Fetch LinkedIn group members with pagination",

  inputSchema: z.object({
    groupId: z.string(),
    start: z.number(),
    count: z.number().max(50),
  }),

  outputSchema: z.object({
    members: z.array(z.any()),
    hasMore: z.boolean(),
    fetched: z.number(),
  }),

  execute: async ({ context }) => {
    const { groupId, start, count } = context;

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

    const data = (await res.json()) as { members?: LinkedInMember[]; hasMore?: boolean };

    return {
      members: (data.members || []) as LinkedInMember[],
      hasMore: Boolean(data.hasMore),
      fetched: data.members?.length ?? 0,
    };
  },
});
