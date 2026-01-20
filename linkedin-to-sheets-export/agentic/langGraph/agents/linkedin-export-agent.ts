import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "../tools/types.js";
import { callModel, shouldContinue } from "./config/call-model.js";
import {
  searchGeoLocationTool,
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
} from "../tools/index.js";

const tools = [
  searchGeoLocationTool,
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
];

const toolNode = new ToolNode(tools);

// Create the graph
const workflow = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    end: "__end__",
  })
  .addEdge("tools", "agent");

// Compile the graph
export const linkedInExportAgent = workflow.compile();
