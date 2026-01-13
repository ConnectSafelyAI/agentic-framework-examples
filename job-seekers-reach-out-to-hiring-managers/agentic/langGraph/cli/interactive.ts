import { input } from "@inquirer/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { createJobSearchAgent } from "../agents/job-search-outreach-agent.js";
import type { AgentStateType } from "../tools/types.js";
import { displayBanner, displayResponse, displayError } from "./display.js";
import { isSpecialCommand, handleCommand } from "./commands.js";

export async function runInteractive() {
  displayBanner();

  const agent = createJobSearchAgent();
  let conversationState: AgentStateType | null = null;

  while (true) {
    try {
      const query = await input({
        message: "You:",
        validate: (value) => {
          if (!value.trim()) {
            return "Please enter a query or command";
          }
          return true;
        },
      });

      if (isSpecialCommand(query)) {
        const result = handleCommand(query, conversationState);

        if (result.shouldExit) {
          process.exit(0);
        }

        if (result.newState !== undefined) {
          conversationState = result.newState;
        }

        if (!result.shouldContinue) {
          continue;
        }
      }

      console.log("\n🤖 Agent: Working on it...\n");

      const newMessage = new HumanMessage(query);

      const currentState = conversationState
        ? {
            ...conversationState,
            messages: [...conversationState.messages, newMessage],
          }
        : {
            messages: [newMessage],
          };

      const result = await agent.invoke(currentState, { recursionLimit: 50 });

      const recentMessages = result.messages.slice(-10);
      conversationState = {
        ...result,
        messages: recentMessages,
      };

      displayResponse(result.messages);
    } catch (error) {
      displayError(error);

      if (error instanceof Error && error.message.includes("parts field")) {
        console.log("\n🔄 Resetting conversation state...");
        conversationState = null;
      }
    }
  }
}
