import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const sendConnectionRequestTool = createTool({
  id: "send-connection-request",
  description: "Send a LinkedIn connection request with a custom message",

  inputSchema: z.object({
    profileId: z.string().describe("Profile ID (vanity name)"),
    customMessage: z.string().describe("Custom message to include with the connection request"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),

  execute: async ({ context }) => {
    const { profileId, customMessage } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/connect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          customMessage,
        }),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(errorData.message || "Failed to send connection request");
    }

    const data = (await res.json()) as { message?: string };
    return {
      success: true,
      message: data.message,
    };
  },
});