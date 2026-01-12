import { END } from "@langchain/langgraph";
import type { AgentStateType } from "../../tools/types.js";
import { AIMessage } from "@langchain/core/messages";

export function shouldContinue(state: AgentStateType): "tools" | typeof END {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // Check if last message has tool calls
  if (
    lastMessage &&
    lastMessage instanceof AIMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  // If last message is an AIMessage without tool calls, we're done
  if (lastMessage && lastMessage instanceof AIMessage) {
    return END;
  }

  // Default to ending if we can't determine
  return END;
}
