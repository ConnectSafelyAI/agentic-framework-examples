/// <reference types="node" />
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fetchGroupMembersByUrlTool = createTool({
  id: "fetch-group-id-by-url",
  description: "Resolve a LinkedIn group URL into a groupId",

  inputSchema: z.object({
    groupUrl: z
      .string()
      .url()
      .describe("LinkedIn group URL"),
  }),

  outputSchema: z.object({
    groupId: z.string(),
  }),

  execute: async ({ context }) => {
    const { groupUrl } = context;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/resolve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupUrl }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to resolve LinkedIn group URL");
    }

    const data = await res.json();

    if (!data.groupId) {
      throw new Error("groupId not found for provided URL");
    }

    return {
      groupId: data.groupId,
    };
  },
});
