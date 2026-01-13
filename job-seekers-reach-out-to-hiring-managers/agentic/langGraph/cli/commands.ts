import type { AgentStateType } from "../tools/types.js";

export function isSpecialCommand(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  return ['exit', 'quit', 'clear', 'help'].includes(normalized);
}

export function handleCommand(
  command: string,
  state: AgentStateType | null
): { shouldExit: boolean; shouldContinue: boolean; newState?: AgentStateType | null } {
  const normalized = command.toLowerCase().trim();

  switch (normalized) {
    case 'exit':
    case 'quit':
      return { shouldExit: true, shouldContinue: false };
    
    case 'clear':
      return { shouldExit: false, shouldContinue: false, newState: null };
    
    case 'help':
      console.log("\n📋 Available commands:");
      console.log("  exit, quit  - Exit the agent");
      console.log("  clear       - Clear conversation history");
      console.log("  help        - Show this help\n");
      return { shouldExit: false, shouldContinue: false };
    
    default:
      return { shouldExit: false, shouldContinue: true };
  }
}