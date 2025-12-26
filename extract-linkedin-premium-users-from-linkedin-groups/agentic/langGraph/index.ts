#!/usr/bin/env node
import "dotenv/config";
import dotenv from "dotenv";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { createLinkedInAgent } from "./agents/linkedin-group-members-fetcher-agent.js";
import { HumanMessage } from "@langchain/core/messages";
import type { AgentStateType } from "./tools/types/index.js";
// Load environment variables
dotenv.config();

/**
 * Interactive CLI for the LangGraph LinkedIn Premium Members Agent
 */
async function interactiveMode() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  LinkedIn Premium Members Agent (LangGraph v0.2.x)        ║");
  console.log("║  Interactive Mode                                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Create readline interface
  const rl = readline.createInterface({ input, output });

  // Create the agent once
  const agent = createLinkedInAgent();
  
  // Maintain conversation state
  let conversationState: AgentStateType | null = null;

  console.log("💡 Type your query or 'help' for examples. Type 'exit' to quit.\n");

  // Main interaction loop
  while (true) {
    try {
      const query = await rl.question("You: ");
      
      // Handle special commands
      if (!query.trim()) continue;
      
      if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit") {
        console.log("\n👋 Goodbye!\n");
        rl.close();
        process.exit(0);
      }

      if (query.toLowerCase() === "help") {
        showHelp();
        continue;
      }

      if (query.toLowerCase() === "clear" || query.toLowerCase() === "reset") {
        conversationState = null;
        console.log("\n🔄 Conversation cleared!\n");
        continue;
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
      // Keep the last 10 messages max to maintain context without overflow
      const recentMessages = result.messages.slice(-10);
      conversationState = {
        ...result,
        messages: recentMessages,
      };

      // Get the last message (agent's response)
      const lastMessage = result.messages[result.messages.length - 1];
      
      // Check for tool results in the message stream
      const toolMessages = result.messages.filter((m: any) => m._getType && m._getType() === "tool");
      
      // Extract text content
      const textContent = "content" in lastMessage && lastMessage.content 
        ? String(lastMessage.content).trim()
        : "";

      // Display the response
      if (textContent) {
        console.log(`\n🤖 Agent: ${textContent}\n`);
      } else if (toolMessages.length > 0) {
        console.log(`\n🤖 Agent: Task completed successfully!\n`);
        console.log("📊 Tool Results:");
        toolMessages.forEach((msg: any, idx: number) => {
          try {
            const toolResult = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            console.log(`\n  ${idx + 1}. ${msg.name || 'Tool'}:`);
            if (toolResult.spreadsheetUrl) {
              console.log(`     📄 Spreadsheet: ${toolResult.spreadsheetUrl}`);
            }
            if (toolResult.totalFetched !== undefined) {
              console.log(`     👥 Total fetched: ${toolResult.totalFetched}`);
            }
            if (toolResult.totalFiltered !== undefined) {
              console.log(`     ✨ Premium/Verified: ${toolResult.totalFiltered}`);
            }
            if (toolResult.membersAdded !== undefined) {
              console.log(`     ➕ Members added: ${toolResult.membersAdded}`);
            }
          } catch (e) {
            // If can't parse, just show raw content
            console.log(`     ${String(msg.content).substring(0, 100)}...`);
          }
        });
        console.log();
      } else {
        console.log(`\n🤖 Agent: ${JSON.stringify(lastMessage).substring(0, 200)}\n`);
      }

    } catch (error) {
      console.error("\n❌ Error:", error instanceof Error ? error.message : error);
      
      // If it's an API error about missing parts, clear conversation state
      if (error instanceof Error && error.message.includes('parts field')) {
        console.log("\n🔄 Resetting conversation state...");
        conversationState = null;
      }
      
      console.log("\n💡 Try again or type 'help' for examples.\n");
    }
  }
}

/**
 * One-shot mode (existing functionality)
 */
async function oneShotMode(query: string) {
  const agent = createLinkedInAgent();
  
  const initialState = {
    messages: [new HumanMessage(query)],
  };

  console.log("\n🤖 Starting LinkedIn Premium Members Agent (LangGraph)...\n");
  console.log(`📝 Query: ${query}\n`);

  const result = await agent.invoke(initialState);
  
  const messages = result.messages;
  const lastMessage = messages[messages.length - 1];
  
  // Check for tool results
  const toolMessages = messages.filter((m: any) => m._getType && m._getType() === "tool");
  
  // Extract text content
  const textContent = "content" in lastMessage && lastMessage.content 
    ? String(lastMessage.content).trim()
    : "";

  console.log("\n✅ Agent Response:");
  if (textContent) {
    console.log(textContent);
  } else if (toolMessages.length > 0) {
    console.log("Task completed successfully!\n");
    console.log("📊 Tool Results:");
    toolMessages.forEach((msg: any, idx: number) => {
      try {
        const toolResult = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        console.log(`\n  ${idx + 1}. ${msg.name || 'Tool'}:`);
        if (toolResult.spreadsheetUrl) {
          console.log(`     📄 Spreadsheet: ${toolResult.spreadsheetUrl}`);
        }
        if (toolResult.totalFetched !== undefined) {
          console.log(`     👥 Total fetched: ${toolResult.totalFetched}`);
        }
        if (toolResult.totalFiltered !== undefined) {
          console.log(`     ✨ Premium/Verified: ${toolResult.totalFiltered}`);
        }
        if (toolResult.membersAdded !== undefined) {
          console.log(`     ➕ Members added: ${toolResult.membersAdded}`);
        }
      } catch (e) {
        console.log(`     ${String(msg.content).substring(0, 100)}...`);
      }
    });
  } else {
    console.log(JSON.stringify(lastMessage, null, 2));
  }
  console.log("\n");
}

/**
 * Show help message
 */
function showHelp() {
  console.log("\n📚 Example Queries:");
  console.log("  1. Fetch all premium members from LinkedIn group ID 12345");
  console.log("  2. Get premium members from https://www.linkedin.com/groups/12345");
  console.log("  3. Save them to a Google Sheet");
  console.log("  4. Filter premium members from the results");
  console.log("\n💡 Special Commands:");
  console.log("  - help     : Show this help message");
  console.log("  - clear    : Clear conversation history");
  console.log("  - exit     : Exit the program\n");
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Check for flags
  if (args.includes("--help") || args.includes("-h")) {
    console.log("\n📋 LinkedIn Premium Members Agent (LangGraph v0.2.x)\n");
    console.log("Usage:");
    console.log("  npm run dev                    # Interactive mode");
    console.log('  npm run dev -- "Your query"    # One-shot mode\n');
    console.log("Flags:");
    console.log("  -i, --interactive              # Force interactive mode");
    console.log("  -h, --help                     # Show this help\n");
    showHelp();
    return;
  }

  // Interactive mode if no arguments or -i flag
  if (args.length === 0 || args.includes("-i") || args.includes("--interactive")) {
    await interactiveMode();
  } else {
    // One-shot mode with query
    const query = args.filter(arg => !arg.startsWith("-")).join(" ");
    await oneShotMode(query);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { interactiveMode, oneShotMode };