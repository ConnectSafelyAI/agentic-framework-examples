import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import {
  searchGeoLocationTool,
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
} from "../tools/index.js";
import { linkedInExportAgentInstructions } from "./instructions.js";

export const linkedInExportAgent = new Agent({
  name: "LinkedIn to Sheets Export Agent",

  model: "google/gemini-3-flash-preview",

  instructions: linkedInExportAgentInstructions,
  tools: {
    searchGeoLocationTool,
    searchPeopleTool,
    exportToSheetsTool,
    exportToJsonTool,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra.db",
    }),
  }),
});
