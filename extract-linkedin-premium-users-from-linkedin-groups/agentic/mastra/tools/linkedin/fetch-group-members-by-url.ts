import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { GroupMembersResponse } from "./types";

// ============================================================================
// TOOL: FETCH GROUP MEMBERS BY URL
// ============================================================================
// Fetches LinkedIn group members using the group URL instead of requiring the group ID.
// Automatically extracts the group ID from the URL for user convenience.

export const fetchGroupMembersByUrlTool = createTool({
  id: "get-group-members-by-url",
  description:
    "Fetch LinkedIn group members using the group URL instead of ID. Automatically extracts group ID from URL.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupUrl: z
      .string()
      .url()
      .describe(
        "LinkedIn group URL (e.g., https://www.linkedin.com/groups/9357376/)"
      ),
    count: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Number of members per request"),
    start: z.number().min(0).default(0).describe("Pagination offset"),
  }),
  outputSchema: z.object({
    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
      })
    ),
    hasMore: z.boolean(),
    groupId: z.string(),
  }),
  execute: async ({ context }) => {
    // Extract group ID from URL
    const groupIdMatch = context.groupUrl.match(/groups\/(\d+)/);
    if (!groupIdMatch) {
      throw new Error("Invalid group URL - could not extract group ID");
    }
    const groupId = groupIdMatch[1];

    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          count: context.count,
          start: context.start,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    const data = (await response.json()) as GroupMembersResponse;

    return {
      members: data.members,
      hasMore: data.hasMore,
      groupId,
    };
  },
});

