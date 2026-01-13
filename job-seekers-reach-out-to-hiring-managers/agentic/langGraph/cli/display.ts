import { AIMessage, ToolMessage } from "@langchain/core/messages";

export function displayBanner() {
  console.log("\n" + "=".repeat(60));
  console.log("🧠 LinkedIn Job Search → Hiring Manager Outreach Agent");
  console.log("   Powered by LangGraph");
  console.log("=".repeat(60));
  console.log("Type 'exit' or 'quit' to exit\n");
}

export function displayResponse(messages: any[]) {
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage instanceof AIMessage) {
    if (lastMessage.content) {
      console.log(`\n🤖 Agent: ${lastMessage.content}\n`);
    }
  }
}

export function displayError(error: unknown) {
  if (error instanceof Error) {
    console.error(`\n❌ Error: ${error.message}\n`);
  } else {
    console.error(`\n❌ Unknown error: ${error}\n`);
  }
}