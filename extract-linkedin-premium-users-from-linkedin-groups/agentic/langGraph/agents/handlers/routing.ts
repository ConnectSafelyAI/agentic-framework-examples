/**
 * Routing Logic
 * Responsibility: Determine workflow routing decisions
 */

import { END } from "@langchain/langgraph";
import type { AgentStateType } from "../../tools/types/index.js";

/**
 * Router function that determines if we should continue to tools or end
 * Returns "tools" if the last message has tool calls, otherwise END
 */
export function shouldContinue(state: AgentStateType): "tools" | typeof END {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return END;
}
