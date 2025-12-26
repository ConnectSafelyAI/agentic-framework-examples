/**
 * Display Utilities
 * Responsibility: Format and display agent responses and results
 */

/**
 * Display formatted agent response
 */
export function displayResponse(messages: any[]) {
  const lastMessage = messages[messages.length - 1];
  const toolMessages = messages.filter((m: any) => m._getType && m._getType() === "tool");
  
  // Extract text content
  const textContent = "content" in lastMessage && lastMessage.content 
    ? String(lastMessage.content).trim()
    : "";

  // Display based on what we have
  if (textContent) {
    console.log(`\n🤖 Agent: ${textContent}\n`);
  } else if (toolMessages.length > 0) {
    console.log(`\n🤖 Agent: Task completed successfully!\n`);
    displayToolResults(toolMessages);
  } else {
    console.log(`\n🤖 Agent: ${JSON.stringify(lastMessage).substring(0, 200)}\n`);
  }
}

/**
 * Display tool execution results
 */
function displayToolResults(toolMessages: any[]) {
  console.log("📊 Tool Results:");
  
  toolMessages.forEach((msg: any, idx: number) => {
    try {
      const toolResult = typeof msg.content === 'string' 
        ? JSON.parse(msg.content) 
        : msg.content;
      
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
      // If can't parse, show truncated content
      console.log(`     ${String(msg.content).substring(0, 100)}...`);
    }
  });
  
  console.log();
}

/**
 * Display welcome banner
 */
export function displayBanner() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  LinkedIn Premium Members Agent (LangGraph v0.2.x)        ║");
  console.log("║  Interactive Mode                                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  console.log("💡 Type your query, 'help' for examples, or 'exit' to quit.\n");
}

/**
 * Display help information
 */
export function displayHelp() {
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
 * Display error message
 */
export function displayError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\n❌ Error:", message);
  console.log("\n💡 Try again or type 'help' for examples.\n");
}
