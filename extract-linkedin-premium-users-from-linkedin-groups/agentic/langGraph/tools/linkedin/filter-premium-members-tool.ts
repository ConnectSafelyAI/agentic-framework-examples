/// <reference types="node" />
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { LinkedInMember, FilterMembersResult } from "../types/index.js";

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
