import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface ProcessedMember {
  profileId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  publicIdentifier: string;
  profileUrl: string;
  followerCount: number;
  isPremium: boolean;
  isVerified: boolean;
  badges: string;
  relationshipStatus: string;
  creator: boolean;
  fetchedAt: string;
}
// ============================================================================
// FILTER PREMIUM & VERIFIED MEMBERS
// ============================================================================

export const filterPremiumVerifiedMembersTool = createTool({
  id: "filter-premium-verified-members",
  description:
    "Filter LinkedIn group members to only include Premium or Verified profiles. Checks isPremium, isVerified flags and badge arrays.",
  inputSchema: z.object({
    members: z
      .array(
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
      )
      .describe("Array of group members to filter"),
  }),
  outputSchema: z.object({
    filteredMembers: z.array(
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
        badges: z.string(),
        relationshipStatus: z.string(),
        creator: z.boolean(),
        fetchedAt: z.string(),
      })
    ),
    totalFiltered: z.number(),
    originalCount: z.number(),
  }),
  execute: async ({ context }) => {
    const filteredMembers = context.members.filter((member) => {
      const isPremium = member.isPremium === true;
      const isVerified = member.isVerified === true;
      const hasPremiumBadge =
        member.badges && member.badges.includes("premium");
      const hasVerifiedBadge =
        member.badges && member.badges.includes("verified");

      return isPremium || isVerified || hasPremiumBadge || hasVerifiedBadge;
    });

    const processedMembers: ProcessedMember[] = filteredMembers.map(
      (member) => ({
        profileId: member.profileId,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: member.fullName,
        headline: member.headline,
        publicIdentifier: member.publicIdentifier,
        profileUrl: member.profileUrl,
        followerCount: member.followerCount,
        isPremium: member.isPremium,
        isVerified: member.isVerified,
        badges: member.badges ? member.badges.join(", ") : "",
        relationshipStatus: member.relationshipStatus,
        creator: member.creator,
        fetchedAt: new Date().toISOString(),
      })
    );

    return {
      filteredMembers: processedMembers,
      totalFiltered: processedMembers.length,
      originalCount: context.members.length,
    };
  },
});
