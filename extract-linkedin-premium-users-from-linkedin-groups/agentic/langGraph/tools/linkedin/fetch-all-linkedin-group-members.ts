/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { LinkedInMember, FetchMembersResult } from "../types/index.js";


const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

/**
 * Tool 2: Fetch ALL LinkedIn group members with auto-pagination
 */
export const fetchAllLinkedInGroupMembersTool = tool(
  async ({ groupId, maxMembers }) => {
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
            Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupId, start, count }),
        }
      );

      if (!res.ok) {
        throw new Error("Pagination fetch failed");
      }

      const data = await res.json() as { members?: any[]; hasMore?: boolean };

      const batch = (data.members || []).map((m: any) => ({
        ...m,
        fetchedAt: new Date().toISOString(),
      }));

      allMembers.push(...batch);
      hasMore = Boolean(data.hasMore);
      start += count;

      if (maxMembers && allMembers.length >= maxMembers) {
        break;
      }
    }

    const result: FetchMembersResult = {
      totalFetched: allMembers.length,
      members: maxMembers ? allMembers.slice(0, maxMembers) : allMembers,
    };

    return JSON.stringify(result);
  },
  {
    name: "fetch-all-linkedin-group-members",
    description: "Fetch ALL LinkedIn group members with automatic pagination. Returns complete list.",
    schema: z.object({
      groupId: z.string().describe("The LinkedIn group ID"),
      maxMembers: z.number().optional().describe("Optional maximum number of members to fetch"),
    }),
  }
);