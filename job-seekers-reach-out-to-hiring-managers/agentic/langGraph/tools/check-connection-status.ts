import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const checkConnectionStatusTool = tool(
  async ({ profileId }) => {
    const res = await fetch(
      `https://api.connectsafely.ai/linkedin/relationship/${profileId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to check connection status: ${res.statusText}`);
    }

    const data = await res.json() as {
      connected?: boolean;
      invitationSent?: boolean;
      invitationReceived?: boolean;
    };
    
    return JSON.stringify({
      connected: Boolean(data.connected),
      invitationSent: Boolean(data.invitationSent),
      invitationReceived: Boolean(data.invitationReceived),
    });
  },
  {
    name: "check-connection-status",
    description: "Check the connection status with a LinkedIn profile (connected, invitation sent, etc.). Always check before sending connection request. Returns: { connected: boolean, invitationSent: boolean, invitationReceived: boolean }. After checking, if connected=false AND invitationSent=false, proceed to send connection request.",
    schema: z.object({
      profileId: z.string().describe("Profile ID (vanity name)"),
    }),
  }
);