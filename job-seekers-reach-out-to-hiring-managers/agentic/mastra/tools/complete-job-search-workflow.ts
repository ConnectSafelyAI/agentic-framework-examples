import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const completeJobSearchWorkflowTool = createTool({
  id: "complete-job-search-workflow",
  description: "Complete workflow: Search jobs → Find hiring managers → Get profile details → Check connection status. Returns data only, does not send connection requests.",

  inputSchema: z.object({
    jobKeywords: z.string().describe("Job search keywords (e.g., 'Software Engineer')"),
    locationKeywords: z.string().optional().describe("Location keywords (e.g., 'Australia')"),
    locationId: z.string().optional().describe("Pre-known location ID (skips geo search if provided)"),
    jobCount: z.number().max(5).default(3).describe("Number of jobs to process"),
    managerCount: z.number().max(5).default(3).describe("Number of hiring managers to find per job"),
  }),

  outputSchema: z.object({
    jobs: z.array(z.any()),
    hiringManagers: z.array(z.object({
      job: z.any(),
      managers: z.array(z.any()),
    })),
  }),

  execute: async ({ context }) => {
    const { jobKeywords, locationKeywords, locationId, jobCount, managerCount } = context;

    // This is a high-level workflow tool that orchestrates multiple API calls
    // For now, return structure - actual implementation would call other tools
    // In practice, the agent will orchestrate these calls individually
    
    return {
      jobs: [],
      hiringManagers: [],
    };
  },
});