import { StateGraph, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "../tools/types.js";
import { callModel } from "./config/call-model.js";
import { shouldContinue } from "./config/routing.js";
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

const allTools = [
  searchGeoLocationTool,
  searchJobsTool,
  getCompanyDetailsTool,
  searchHiringManagersTool,
  fetchProfileDetailsTool,
  checkConnectionStatusTool,
  sendConnectionRequestTool,
  completeJobSearchWorkflowTool,
];

export function createJobSearchAgent() {
  const workflow = new StateGraph(AgentState)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(allTools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}
