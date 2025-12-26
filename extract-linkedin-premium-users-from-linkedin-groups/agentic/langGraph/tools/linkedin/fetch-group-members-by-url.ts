/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { LinkedInMember, FilterMembersResult } from "../types/index.js";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";


/**
 * Tool 3: Fetch group members by URL
 */
export const fetchGroupMembersByUrlTool = tool(
  async ({ groupUrl, count, start }) => {
    const actualCount = count ?? 20;
    const actualStart = start ?? 0;
    
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members-by-url",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupUrl, start: actualStart, count: actualCount }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch by URL: ${res.statusText}`);
    }

    const data = await res.json();
    return JSON.stringify(data);
  },
  {
    name: "fetch-group-members-by-url",
    description: "Resolve a LinkedIn group URL to extract groupId and fetch members",
    schema: z.object({
      groupUrl: z.string().describe("The LinkedIn group URL"),
      count: z.number().optional().describe("Number of members to fetch"),
      start: z.number().optional().describe("Starting offset"),
    }),
  }
);

/**
 * Tool 4: Filter Premium/Verified members
 */
export const filterPremiumVerifiedMembersTool = tool(
  async ({ members }) => {
    const linkedInMembers = members as LinkedInMember[];
    
    const filtered = linkedInMembers.filter((m) => {
      const badges = m.badges || [];
      return (
        m.isPremium === true ||
        m.isVerified === true ||
        badges.includes("premium") ||
        badges.includes("verified")
      );
    });

    const result: FilterMembersResult = {
      totalInput: linkedInMembers.length,
      totalFiltered: filtered.length,
      members: filtered,
    };

    return JSON.stringify(result);
  },
  {
    name: "filter-premium-verified-members",
    description: "Filter an array of LinkedIn members to only include Premium or Verified profiles",
    schema: z.object({
      members: z.array(z.record(z.any())).describe("Array of LinkedIn member objects to filter"),
    }),
  }
);