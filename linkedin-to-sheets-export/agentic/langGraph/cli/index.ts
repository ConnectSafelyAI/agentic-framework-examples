import { displayWelcome, displayHelp } from "./display.js";
import { runInteractiveLoop } from "./interactive.js";

export async function runInteractive() {
  // Check for required environment variables
  const requiredVars = [
    "CONNECTSAFELY_API_TOKEN",
    "GOOGLE_GENERATIVE_AI_API_KEY",
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing environment variables: ${missing.join(", ")}`);
    console.error("Please set them in your .env file.\n");
    process.exit(1);
  }

  // Display welcome message
  displayWelcome();

  // Show help on first run
  displayHelp();

  // Start interactive loop
  await runInteractiveLoop();
}
