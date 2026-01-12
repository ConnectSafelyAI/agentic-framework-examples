import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import {
  searchGeoLocationTool,
  searchJobsTool,
  getCompanyDetailsTool,
  searchHiringManagersTool,
  fetchProfileDetailsTool,
  checkConnectionStatusTool,
  sendConnectionRequestTool,
  completeJobSearchWorkflowTool,
} from "../tools/index.js";
import { jobSearchOutreachAgentInstructions } from "./instructions.js";

export const jobSearchOutreachAgent = new Agent({
  name: "Job Search → Hiring Manager Outreach Agent",

  model: "google/gemini-3-flash-preview",

  instructions: jobSearchOutreachAgentInstructions,
  tools: {
    searchGeoLocationTool,
    searchJobsTool,
    getCompanyDetailsTool,
    searchHiringManagersTool,
    fetchProfileDetailsTool,
    checkConnectionStatusTool,
    sendConnectionRequestTool,
    completeJobSearchWorkflowTool,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra.db",
    }),
  }),
});
