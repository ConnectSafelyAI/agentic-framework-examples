import { tool } from "@langchain/core/tools";
import { z } from "zod";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

export const sendConnectionRequestTool = tool(
  async ({ profileId, customMessage }) => {
    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/connect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          customMessage,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(errorData.message || `Failed to send connection request: ${res.statusText}`);
    }

    const data = await res.json() as { message?: string };
    
    return JSON.stringify({
      success: true,
      message: data.message,
    });
  },
  {
    name: "send-connection-request",
    description: "Send a LinkedIn connection request with a custom message. Only use if checkConnectionStatusTool shows connected=false AND invitationSent=false. Create a personalized message using the hiring manager's first name and job title.",
    schema: z.object({
      profileId: z.string().describe("Profile ID (vanity name)"),
      customMessage: z.string().describe("Custom message to include with the connection request"),
    }),
  }
);