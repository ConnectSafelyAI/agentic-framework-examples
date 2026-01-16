import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

export function displayWelcome() {
  console.log("\n" + colors.cyan + colors.bright);
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║     📊 LinkedIn to Google Sheets Export Agent (LangGraph)    ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(colors.reset);
  console.log(colors.dim + "Powered by ConnectSafely.ai" + colors.reset);
  console.log("\nType your commands or 'help' for examples. Type 'exit' to quit.\n");
}

export function displayHelp() {
  console.log(colors.yellow + "\n📋 Example Commands:" + colors.reset);
  console.log("  • Search for 50 CEOs in United States");
  console.log("  • Find software engineers in San Francisco with title 'Senior'");
  console.log("  • Export results to Google Sheets");
  console.log("  • Export to JSON file");
  console.log("  • Export to both Sheets and JSON");
  console.log("\n" + colors.yellow + "🔧 Special Commands:" + colors.reset);
  console.log("  • help    - Show this help message");
  console.log("  • clear   - Clear conversation history");
  console.log("  • exit    - Exit the application\n");
}

export function displayMessage(message: BaseMessage) {
  if (message instanceof HumanMessage) {
    console.log(colors.green + "\n👤 You: " + colors.reset + message.content);
  } else if (message instanceof AIMessage) {
    if (message.content) {
      console.log(colors.cyan + "\n🤖 Assistant: " + colors.reset + message.content);
    }
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        console.log(
          colors.magenta +
            `\n🔧 Calling tool: ${toolCall.name}` +
            colors.reset
        );
      }
    }
  } else if (message instanceof ToolMessage) {
    try {
      const content = JSON.parse(message.content as string);
      if (content.success !== undefined) {
        const status = content.success ? "✅" : "❌";
        console.log(colors.blue + `\n${status} Tool result: ` + colors.reset);
        if (content.count !== undefined) {
          console.log(`   Found ${content.count} profiles`);
        }
        if (content.rowsExported !== undefined) {
          console.log(`   Exported ${content.rowsExported} rows`);
        }
        if (content.spreadsheetUrl) {
          console.log(`   URL: ${content.spreadsheetUrl}`);
        }
        if (content.filePath) {
          console.log(`   File: ${content.filePath}`);
        }
        if (content.error) {
          console.log(`   Error: ${content.error}`);
        }
      }
    } catch {
      console.log(colors.blue + "\n📄 Tool result received" + colors.reset);
    }
  }
}

export function displayError(error: Error) {
  console.log(colors.yellow + "\n❌ Error: " + colors.reset + error.message);
}

export function displayGoodbye() {
  console.log(colors.cyan + "\n👋 Goodbye!" + colors.reset + "\n");
}
