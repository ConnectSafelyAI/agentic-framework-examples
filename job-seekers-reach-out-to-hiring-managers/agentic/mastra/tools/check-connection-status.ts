import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { RelationshipStatus } from "./types.js";

export const checkConnectionStatusTool = createTool({
  id: "check-connection-status",
  description: "Check the connection status with a LinkedIn profile (connected, invitation sent, etc.)",

  inputSchema: z.object({
    profileId: z.string().describe("Profile ID (vanity name)"),
  }),

  outputSchema: z.object({
    connected: z.boolean(),
    invitationSent: z.boolean(),
    invitationReceived: z.boolean(),
  }),

  execute: async ({ context }) => {
    const { profileId } = context;

    const res = await fetch(
      `https://api.connectsafely.ai/linkedin/relationship/${profileId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to check connection status");
    }

    const data = (await res.json()) as {
      connected?: boolean;
      invitationSent?: boolean;
      invitationReceived?: boolean;
    };
    return {
      connected: Boolean(data.connected),
      invitationSent: Boolean(data.invitationSent),
      invitationReceived: Boolean(data.invitationReceived),
    } as RelationshipStatus;
  },
});