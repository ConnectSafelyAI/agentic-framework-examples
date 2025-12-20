import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { LinkedInMember } from "./index";

export const filterPremiumVerifiedMembersTool = createTool({
  id: "filter-premium-verified-members",
  description: "Filter Premium or Verified LinkedIn members",

  inputSchema: z.object({
    members: z.array(z.any()),
  }),

  outputSchema: z.object({
    totalInput: z.number(),
    totalFiltered: z.number(),
    members: z.array(z.any()),
  }),

  execute: async ({ context }) => {
    const members = context.members as LinkedInMember[];

    const filtered = members.filter((m) => {
      const badges = m.badges || [];
      return (
        m.isPremium === true ||
        m.isVerified === true ||
        badges.includes("premium") ||
        badges.includes("verified")
      );
    });

    return {
      totalInput: members.length,
      totalFiltered: filtered.length,
      members: filtered,
    };
  },
});
