import "dotenv/config";
import { createLinkedInAgent } from "./agent/linkedin-group-members-fetcher-agent.js";
import { disconnectConnectSafely, getConnectSafelyTools } from "./mcp/connectsafely-client.js";

/**
 * Main entry point for LinkedIn Automation Agent
 * 
 * Supports both command-line arguments and interactive mode
 */

async function main() {
  // Validate environment variables
  if (!process.env.CONNECTSAFELY_API_TOKEN) {
    console.error("❌ Error: CONNECTSAFELY_API_TOKEN is required");
    console.error("Get your API key at: https://connectsafely.ai/mcp-server");
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is required");
    console.error("Get your API key at: https://aistudio.google.com/api-keys");
    process.exit(1);
  }

  console.log("🚀 Initializing LinkedIn Automation Agent...\n");

  let agent;
  
  try {
    // Create the agent (this connects to MCP and loads tools)
    agent = await createLinkedInAgent();
    console.log("✅ Agent initialized successfully!\n");
  } catch (error: any) {
    console.error("❌ Failed to initialize agent:", error.message);
    await cleanup();
    process.exit(1);
  }

  // Check for command-line arguments (non-interactive mode)
  const args = process.argv.slice(2);
  const query = args.join(" ");

  if (query) {
    // Non-interactive mode: execute single query and exit
    await executeQuery(agent, query);
    await cleanup();
    process.exit(0);
  } else {
    // Interactive mode: start REPL
    await startInteractiveMode(agent);
  }
}

/**
 * Execute a single query
 */
async function executeQuery(agent: any, query: string) {
  console.log(`User: ${query}\n`);
  
  try {
    const result = await agent.generate(query);
    console.log(`Agent: ${result.text}\n`);

    // Show tool execution summary if available
    if (result.toolResults && result.toolResults.length > 0) {
      console.log("─".repeat(60));
      console.log("📊 Tools Used:");
      console.log("─".repeat(60));
      result.toolResults.forEach((toolResult: any, index: number) => {
        const toolName = toolResult.toolName || toolResult.payload?.toolName || "Unknown";
        console.log(`${index + 1}. ${toolName}`);
      });
      console.log();
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * Start interactive REPL mode
 */
async function startInteractiveMode(agent: any) {
  const readline = await import("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Show available tools count
  let toolsInfo = "";
  try {
    const tools = await getConnectSafelyTools();
    const toolCount = Object.keys(tools).length;
    toolsInfo = ` (${toolCount} tools available)`;
  } catch (error) {
    // Ignore if we can't get tools info
  }

  console.log("═".repeat(70));
  console.log("🤖 LinkedIn Automation Agent - Interactive Mode");
  console.log("═".repeat(70));
  console.log(`✨ Full access to ALL ConnectSafely MCP tools${toolsInfo}`);
  console.log('💡 Type your requests naturally, or "exit" to quit');
  console.log('📝 Example: "Get 10 premium members from https://linkedin.com/groups/123"\n');

  function loop() {
    rl.question("> ", async (input) => {
      const trimmedInput = input.trim();
      
      if (trimmedInput.toLowerCase() === "exit") {
        console.log("\n👋 Goodbye!");
        await cleanup();
        rl.close();
        process.exit(0);
      }

      if (trimmedInput.toLowerCase() === "list-tools") {
        try {
          const tools = await getConnectSafelyTools();
          const toolNames = Object.keys(tools);
          console.log(`\n📋 Available Tools (${toolNames.length}):\n`);
          toolNames.forEach((name, index) => {
            console.log(`   ${index + 1}. ${name}`);
          });
          console.log();
        } catch (error: any) {
          console.error(`\n❌ Error listing tools: ${error.message}\n`);
        }
        loop();
        return;
      }

      if (!trimmedInput) {
        loop();
        return;
      }

      try {
        console.log("\n🤖 Agent:");
        const result = await agent.generate(trimmedInput);
        console.log(result.text);
        
        // Show tools used if available
        if (result.toolResults && result.toolResults.length > 0) {
          console.log("\n📊 Tools Used:");
          result.toolResults.forEach((toolResult: any, index: number) => {
            const toolName = toolResult.toolName || toolResult.payload?.toolName || "Unknown";
            console.log(`   ${index + 1}. ${toolName}`);
          });
        }
        console.log();
      } catch (error: any) {
        console.error(`\n❌ Error: ${error.message}\n`);
      }

      loop();
    });
  }

  loop();
}

/**
 * Cleanup function - disconnect from MCP server
 */
async function cleanup() {
  try {
    await disconnectConnectSafely();
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Handle process termination signals
 */
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await cleanup();
  process.exit(0);
});

// Run the application
main().catch(async (error) => {
  console.error("❌ Unhandled error:", error);
  await cleanup();
  process.exit(1);
});