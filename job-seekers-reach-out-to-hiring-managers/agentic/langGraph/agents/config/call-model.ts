import { SystemMessage, AIMessage } from "@langchain/core/messages";
import type { AgentStateType } from "../../tools/types.js";
import { createModel } from "./model.js";
import { getSystemPrompt } from "./prompt.js";

const model = createModel();
const SYSTEM_PROMPT = getSystemPrompt();

export async function callModel(state: AgentStateType) {
  const messages = state.messages;

  // Filter out messages with empty content, BUT keep messages with tool_calls
  const validMessages = messages.filter((msg) => {
    // 1. Keep the message if it has tool calls (even if content is empty)
    // This is critical for preventing "function call turn" errors
    if ("tool_calls" in msg && (msg as any).tool_calls?.length > 0) {
      return true;
    }

    // 2. Otherwise, filter out empty content
    if (!msg.content) return false;
    if (typeof msg.content === "string" && msg.content.trim() === "")
      return false;
    if (Array.isArray(msg.content) && msg.content.length === 0) return false;

    return true;
  });

  // Add system message only on first call
  const systemMessage = new SystemMessage(SYSTEM_PROMPT);
  const allMessages =
    validMessages.length > 0 && validMessages[0].content === SYSTEM_PROMPT
      ? validMessages
      : [systemMessage, ...validMessages];

  try {
    // Invoke the model
    const response = await model.invoke(allMessages);

    // Ensure response is an AIMessage
    if (!(response instanceof AIMessage)) {
      throw new Error("Model did not return an AIMessage");
    }

    return {
      messages: [response],
    };
  } catch (error) {
    console.error("Error in callModel:", error);
    // Return a final message to stop the loop
    return {
      messages: [new AIMessage("I encountered an error. Please try again.")],
    };
  }
}
