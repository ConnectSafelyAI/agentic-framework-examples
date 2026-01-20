import { displayHelp, displayGoodbye } from "./display.js";

export type SpecialCommand = "help" | "clear" | "exit" | null;

export function parseSpecialCommand(input: string): SpecialCommand {
  const trimmed = input.trim().toLowerCase();

  switch (trimmed) {
    case "help":
    case "?":
      return "help";
    case "clear":
    case "reset":
      return "clear";
    case "exit":
    case "quit":
    case "q":
      return "exit";
    default:
      return null;
  }
}

export function handleSpecialCommand(command: SpecialCommand): boolean {
  switch (command) {
    case "help":
      displayHelp();
      return true;
    case "exit":
      displayGoodbye();
      process.exit(0);
    case "clear":
      console.log("\n🗑️  Conversation cleared.\n");
      return true;
    default:
      return false;
  }
}
