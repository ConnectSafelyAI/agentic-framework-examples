#!/usr/bin/env bun
import "dotenv/config";
import readline from "readline";
import { jobSearchOutreachAgent } from "./agents/job-search-outreach-agent.js";

// Check if command-line argument is provided (non-interactive mode)
const args = process.argv.slice(2);
const query = args.join(" ");

if (query) {
  // Non-interactive mode: execute query and exit
  (async () => {
    try {
      const result = await jobSearchOutreachAgent.generate(query);
      console.log("\n" + result.text);
      
      // If there are tool results, show summary
      if (result.toolResults && result.toolResults.length > 0) {
        console.log("\n--- Tool Execution Summary ---");
        result.toolResults.forEach((toolResult: any) => {
          if (toolResult.payload?.result && typeof toolResult.payload.result === 'object') {
            const result = toolResult.payload.result;
            if (result.jobs) {
              console.log(`💼 Jobs found: ${result.jobs.length}`);
            }
            if (result.people) {
              console.log(`👥 Hiring managers found: ${result.people.length}`);
            }
            if (result.success) {
              console.log(`✅ Connection request sent successfully`);
            }
          }
        });
      }
      
      process.exit(0);
    } catch (err: any) {
      console.error("\n❌ Error:", err.message || err);
      process.exit(1);
    }
  })();
} else {
  // Interactive mode: REPL
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🧠 LinkedIn Job Search → Hiring Manager Outreach Agent");
  console.log("Type 'exit' to quit.\n");

  async function loop() {
    rl.question("> ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      if (!input.trim()) {
        loop();
        return;
      }

      try {
        const result = await jobSearchOutreachAgent.generate(input);
        console.log("\n" + result.text);
      } catch (err: any) {
        console.error("\n❌ Error:", err.message || err);
      }

      console.log();
      loop();
    });
  }

  loop();
}