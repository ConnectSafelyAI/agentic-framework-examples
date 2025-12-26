/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

/**
 * Tool 1: Fetch LinkedIn group members with pagination
 */
export const fetchLinkedInGroupMembersTool = tool(
  async ({ groupId, start, count }) => {
    const actualStart = start ?? 0;
    const actualCount = count ?? 50;
    
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, start: actualStart, count: actualCount }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch members: ${res.statusText}`);
    }

    const data = await res.json() as { members?: any[]; hasMore?: boolean };
    
    return JSON.stringify({
      members: data.members || [],
      hasMore: data.hasMore || false,
      fetched: (data.members || []).length,
    });
  },
  {
    name: "fetch-linkedin-group-members",
    description: "Fetch a single paginated batch of LinkedIn group members. Use for low-level control.",
    schema: z.object({
      groupId: z.string().describe("The LinkedIn group ID"),
      start: z.number().optional().describe("Starting offset for pagination"),
      count: z.number().optional().describe("Number of members to fetch (max 100)"),
    }),
  }
);