/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { LinkedInMember } from "../types/index.js";


const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

/**
 * Tool 5: Complete workflow - Fetch + Filter Premium members
 */
export const completeGroupMembersWorkflowTool = tool(
  async ({ groupId, maxMembers }) => {
    // Step 1: Fetch all members
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
        throw new Error("Failed to fetch members");
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

    const members = maxMembers ? allMembers.slice(0, maxMembers) : allMembers;

    // Step 2: Filter for Premium/Verified
    const filtered = members.filter((m) => {
      const badges = m.badges || [];
      return (
        m.isPremium === true ||
        m.isVerified === true ||
        badges.includes("premium") ||
        badges.includes("verified")
      );
    });

    return JSON.stringify({
      totalFetched: members.length,
      totalFiltered: filtered.length,
      members: filtered,
    });
  },
  {
    name: "complete-group-members-workflow",
    description: "Complete workflow: Fetch ALL group members and filter for Premium/Verified. Does NOT save to sheets.",
    schema: z.object({
      groupId: z.string().describe("The LinkedIn group ID"),
      maxMembers: z.number().optional().describe("Optional max members to fetch"),
    }),
  }
);
