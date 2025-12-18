import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { GroupMember, GroupMembersResponse } from "./types";

// ============================================================================
// TOOL: COMPLETE GROUP MEMBERS WORKFLOW
// ============================================================================
// End-to-end automation that fetches all LinkedIn group members, filters for Premium/Verified profiles,
// and exports to Google Sheets in a single operation. This is the most comprehensive tool for complete automation.

export const completeGroupMembersWorkflowTool = createTool({
  id: "complete-group-members-workflow",
  description:
    "Complete workflow: Fetch all LinkedIn group members, filter for Premium/Verified, and export to Google Sheets in one operation.",
  inputSchema: z.object({
    // ConnectSafely API
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe("LinkedIn group ID"),
    batchSize: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Members per API request"),

    // Google Sheets
    spreadsheetId: z.string().describe("Google Sheets spreadsheet ID"),
    sheetName: z.string().describe("Sheet name/tab"),
    googleAccessToken: z.string().describe("Google OAuth2 access token"),

    // Options
    filterPremiumOnly: z
      .boolean()
      .default(true)
      .describe("Only include Premium/Verified members"),
    maxMembers: z
      .number()
      .optional()
      .describe("Max members to fetch (optional)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    totalFetched: z.number(),
    totalFiltered: z.number(),
    rowsExported: z.number(),
    requestsMade: z.number(),
    spreadsheetUrl: z.string(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Step 1: Fetch all members with pagination
    const allMembers: GroupMember[] = [];
    let start = 0;
    let hasMore = true;
    let requestsMade = 0;

    while (hasMore) {
      if (context.maxMembers && allMembers.length >= context.maxMembers) {
        break;
      }

      const response = await fetch(
        "https://api.connectsafely.ai/linkedin/groups/members",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: context.groupId,
            count: context.batchSize,
            start: start,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch group members: ${response.statusText}`
        );
      }

      const data = (await response.json()) as GroupMembersResponse;
      allMembers.push(...data.members);
      hasMore = data.hasMore;
      start += context.batchSize;
      requestsMade++;

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 2: Filter for Premium/Verified members
    let membersToExport = allMembers;

    if (context.filterPremiumOnly) {
      membersToExport = allMembers.filter((member) => {
        const isPremium = member.isPremium === true;
        const isVerified = member.isVerified === true;
        const hasPremiumBadge =
          member.badges && member.badges.includes("premium");
        const hasVerifiedBadge =
          member.badges && member.badges.includes("verified");

        return isPremium || isVerified || hasPremiumBadge || hasVerifiedBadge;
      });
    }

    // Process members for export
    const processedMembers = membersToExport.map((member) => ({
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
    }));

    // Step 3: Export to Google Sheets
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}`,
      {
        headers: {
          Authorization: `Bearer ${context.googleAccessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to read sheet: ${getResponse.statusText}`);
    }

    const sheetData = await getResponse.json();
    const existingRows = sheetData.values || [];
    const existingProfileIds = new Set(
      existingRows.slice(1).map((row: string[]) => row[0])
    );

    const rowsToAppend = processedMembers
      .filter((member) => !existingProfileIds.has(member.profileId))
      .map((member) => [
        member.profileId,
        member.firstName,
        member.lastName,
        member.fullName,
        member.headline,
        member.publicIdentifier,
        member.profileUrl,
        member.followerCount,
        member.isPremium,
        member.isVerified,
        member.badges,
        member.relationshipStatus,
      ]);

    let rowsExported = 0;

    if (rowsToAppend.length > 0) {
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rowsToAppend,
          }),
        }
      );

      if (!appendResponse.ok) {
        throw new Error(
          `Failed to append to sheet: ${appendResponse.statusText}`
        );
      }

      rowsExported = rowsToAppend.length;
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${context.spreadsheetId}`;
    const summary = `Fetched ${allMembers.length} members, filtered to ${processedMembers.length} Premium/Verified profiles, exported ${rowsExported} new rows to Google Sheets`;

    return {
      success: true,
      totalFetched: allMembers.length,
      totalFiltered: processedMembers.length,
      rowsExported,
      requestsMade,
      spreadsheetUrl,
      summary,
    };
  },
});

