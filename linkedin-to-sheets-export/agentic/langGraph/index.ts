#!/usr/bin/env node
import "dotenv/config";
import { runInteractive } from "./cli/index.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("\n📊 LinkedIn to Google Sheets Export Agent (LangGraph)\n");
    console.log("Usage:");
    console.log("  bun run dev     # Start interactive mode (with watch)");
    console.log("  bun start       # Start interactive mode\n");
    console.log("Flags:");
    console.log("  -h, --help      # Show this help\n");
    return;
  }

  await runInteractive();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { runInteractive };
