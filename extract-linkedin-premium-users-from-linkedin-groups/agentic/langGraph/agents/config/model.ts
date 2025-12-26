/**
 * Model Configuration
 * Responsibility: Initialize and configure the LLM
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { 
  completeGroupMembersWorkflowTool,
  fetchAllLinkedInGroupMembersTool, 
  fetchGroupMembersByUrlTool, 
  fetchLinkedInGroupMembersTool, 
  filterPremiumVerifiedMembersTool 
} from "../../tools/linkedin/index.js";
import { googleSheetsTool } from "../../tools/googlesheet/index.js";

const allTools = [
  completeGroupMembersWorkflowTool,
  fetchAllLinkedInGroupMembersTool,
  fetchGroupMembersByUrlTool,
  fetchLinkedInGroupMembersTool,
  filterPremiumVerifiedMembersTool,
  googleSheetsTool,
];
/**
 * Create and configure the Google Gemini model with tool binding
 */
export function createModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0,
  }).bindTools(allTools);
}
