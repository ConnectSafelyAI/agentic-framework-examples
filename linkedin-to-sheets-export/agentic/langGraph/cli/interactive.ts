import { input } from "@inquirer/prompts";
import { HumanMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { linkedInExportAgent } from "../agents/linkedin-export-agent.js";
import { displayMessage, displayError } from "./display.js";
import { parseSpecialCommand, handleSpecialCommand } from "./commands.js";

export async function runInteractiveLoop() {
  let messages: BaseMessage[] = [];

  while (true) {
    try {
      const userInput = await input({
        message: "You:",
        theme: {
          prefix: "📝",
        },
      });

      // Check for special commands
      const specialCommand = parseSpecialCommand(userInput);
      if (specialCommand) {
        if (specialCommand === "clear") {
          messages = [];
        }
        handleSpecialCommand(specialCommand);
        continue;
      }

      // Skip empty input
      if (!userInput.trim()) {
        continue;
      }

      // Add user message
      const userMessage = new HumanMessage(userInput);
      messages.push(userMessage);

      // Display processing indicator
      process.stdout.write("\n⏳ Processing...");

      // Invoke the agent
      const result = await linkedInExportAgent.invoke({
        messages,
      });

      // Clear the processing indicator
      process.stdout.write("\r" + " ".repeat(20) + "\r");

      // Update messages from result
      messages = result.messages;

      // Display new messages (skip already displayed ones)
      const newMessages = result.messages.slice(-3); // Last few messages
      for (const message of newMessages) {
        if (!(message instanceof HumanMessage)) {
          displayMessage(message);
        }
      }

      console.log(""); // Empty line for readability
    } catch (error) {
      if (error instanceof Error) {
        // Handle Ctrl+C gracefully
        if (error.message.includes("User force closed")) {
          console.log("\n");
          process.exit(0);
        }
        displayError(error);
      }
    }
  }
}
