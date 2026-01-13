import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  searchGeoLocationTool,
  searchJobsTool,
  getCompanyDetailsTool,
  searchHiringManagersTool,
  fetchProfileDetailsTool,
  checkConnectionStatusTool,
  sendConnectionRequestTool,
  completeJobSearchWorkflowTool,
} from "../../tools/index.js";

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

export function createModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-3-flash-preview",
    temperature: 0,
  }).bindTools(allTools);
}
