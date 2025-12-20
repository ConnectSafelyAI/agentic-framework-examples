#!/usr/bin/env node
import "dotenv/config";
import readline from "readline";
import { premiumMembersAgent } from "./mastra/agents/linkedin-group-members-fetcher-agent";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🧠 LinkedIn Premium Members Agent");
console.log("Type 'exit' to quit.\n");

async function loop() {
  rl.question("> ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      process.exit(0);
    }

    try {
        const result = await premiumMembersAgent.generate(input);
          
      console.log("\nAgent:");
      console.dir(result, { depth: null });
    } catch (err) {
      console.error("\nError:", err);
    }

    console.log();
    loop();
  });
}

loop();
