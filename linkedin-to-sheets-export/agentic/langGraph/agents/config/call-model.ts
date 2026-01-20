import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { createModel } from "./model.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import type { AgentStateType } from "../../tools/types.js";
import {
  searchGeoLocationTool,
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
} from "../../tools/index.js";

const tools = [
  searchGeoLocationTool,
  searchPeopleTool,
  exportToSheetsTool,
  exportToJsonTool,
];

export async function callModel(state: AgentStateType) {
  const model = createModel().bindTools(tools);

  const messagesWithSystem = [
    new SystemMessage(SYSTEM_PROMPT),
    ...state.messages,
  ];

  const response = await model.invoke(messagesWithSystem);

  return { messages: [response] };
}

export function shouldContinue(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If no tool calls, end the conversation turn
  if (
    lastMessage instanceof AIMessage &&
    (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0)
  ) {
    return "end";
  }

  // Continue to tool execution
  return "tools";
}
