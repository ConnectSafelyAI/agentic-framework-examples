/**
 * Interactive REPL
 * Responsibility: Main interactive loop for agent conversation
 */

import { input } from '@inquirer/prompts';
import { HumanMessage } from "@langchain/core/messages";
import { createLinkedInAgent } from "../agents/linkedin-group-members-fetcher-agent.js";
import type { AgentStateType } from "../tools/types/index.js";
import { displayBanner, displayResponse, displayError } from "./display.js";
import { isSpecialCommand, handleCommand } from "./commands.js";

/**
 * Run the interactive REPL mode
 */
export async function runInteractive() {
  displayBanner();

  // Create the agent once
  const agent = createLinkedInAgent();
  
  // Maintain conversation state
  let conversationState: AgentStateType | null = null;

  // Main interaction loop
  while (true) {
    try {
      // Get user input with validation
      const query = await input({
        message: 'You:',
        validate: (value) => {
          if (!value.trim()) {
            return 'Please enter a query or command';
          }
          return true;
        },
      });

      // Handle special commands
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

      // Process the query
      console.log("\n🤖 Agent: Working on it...\n");

      // Build state - either continue conversation or start new
      const newMessage = new HumanMessage(query);
      
      const currentState = conversationState 
        ? {
            ...conversationState,
            messages: [...conversationState.messages, newMessage],
          }
        : {
            messages: [newMessage],
          };

      // Invoke the agent
      const result = await agent.invoke(currentState);

      // Update conversation state - keep only recent messages to avoid accumulation
      const recentMessages = result.messages.slice(-10);
      conversationState = {
        ...result,
        messages: recentMessages,
      };

      // Display the response
      displayResponse(result.messages);

    } catch (error) {
      displayError(error);
      
      // If it's an API error about missing parts, clear conversation state
      if (error instanceof Error && error.message.includes('parts field')) {
        console.log("\n🔄 Resetting conversation state...");
        conversationState = null;
      }
    }
  }
}
