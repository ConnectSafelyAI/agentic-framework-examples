/**
 * Call Model Node
 * Responsibility: Handle LLM invocation and message filtering
 */

import { SystemMessage } from "@langchain/core/messages";
import type { AgentStateType } from "../../tools/types/index.js";
import { createModel } from "../config/model.js";
import { getSystemPrompt } from "../config/prompts.js";

// Initialize model and prompt
const model = createModel();
const SYSTEM_PROMPT = getSystemPrompt();

/**
 * Node function that calls the LLM with the current conversation state
 * Filters invalid messages and adds system prompt on first call
 */
export async function callModel(state: AgentStateType) {
  const messages = state.messages;
  
  // Filter out messages with empty content to avoid API errors
  const validMessages = messages.filter((msg) => {
    if (!msg.content) return false;
    if (typeof msg.content === 'string' && msg.content.trim() === '') return false;
    if (Array.isArray(msg.content) && msg.content.length === 0) return false;
    return true;
  });
  
  // Add system message only on first call
  const systemMessage = new SystemMessage(SYSTEM_PROMPT);
  const allMessages = validMessages.length > 0 && validMessages[0].content === SYSTEM_PROMPT
    ? validMessages
    : [systemMessage, ...validMessages];

  // Invoke the model
  const response = await model.invoke(allMessages);
  
  // Log for debugging (only in development)
  if (process.env.DEBUG === 'true') {
    console.log('Model response:', {
      hasToolCalls: 'tool_calls' in response && Array.isArray(response.tool_calls) && response.tool_calls.length > 0,
      toolCallCount: 'tool_calls' in response ? (response.tool_calls as any[])?.length : 0,
      hasContent: !!response.content,
    });
  }
  
  return {
    messages: [response],
  };
}
