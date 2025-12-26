#!/usr/bin/env node
/**
 * LinkedIn Premium Members Agent - Main Entry Point
 * Responsibility: Initialize and start the interactive agent
 */

import "dotenv/config";
import { runInteractive, displayHelp } from "./cli/index.js";

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log("\n📋 LinkedIn Premium Members Agent (LangGraph v0.2.x)\n");
    console.log("Usage:");
    console.log("  bun run dev     # Start interactive mode");
    console.log("  bun start       # Start interactive mode\n");
    console.log("Flags:");
    console.log("  -h, --help      # Show this help\n");
    displayHelp();
    return;
  }

  // Run interactive mode
  await runInteractive();
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { runInteractive };
