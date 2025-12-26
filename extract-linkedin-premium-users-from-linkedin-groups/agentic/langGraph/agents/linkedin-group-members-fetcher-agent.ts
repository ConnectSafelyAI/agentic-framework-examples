/**
 * LinkedIn Group Members Fetcher Agent
 * Responsibility: Assemble the LangGraph StateGraph
 */

import { StateGraph, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "../tools/types/index.js";
import { callModel } from "./handlers/call-model.js";
import { shouldContinue } from "./handlers/routing.js";
import { 
  completeGroupMembersWorkflowTool,
  fetchAllLinkedInGroupMembersTool, 
  fetchGroupMembersByUrlTool, 
  fetchLinkedInGroupMembersTool, 
  filterPremiumVerifiedMembersTool 
} from "../tools/linkedin/index.js";
import { googleSheetsTool } from "../tools/googlesheet/index.js";

const allTools = [
  completeGroupMembersWorkflowTool,
  fetchAllLinkedInGroupMembersTool,
  fetchGroupMembersByUrlTool,
  fetchLinkedInGroupMembersTool,
  filterPremiumVerifiedMembersTool,
  googleSheetsTool,
];
/**
 * Create the LinkedIn agent graph
 * Defines the workflow: agent → tools → agent (loop until no tool calls)
 */
export function createLinkedInAgent() {
  const workflow = new StateGraph(AgentState)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(allTools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}
