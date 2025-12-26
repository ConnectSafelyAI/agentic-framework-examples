/**
 * Command Handlers
 * Responsibility: Handle special commands (help, clear, exit)
 */

import { displayHelp } from "./display.js";
import type { AgentStateType } from "../tools/types/index.js";

/**
 * Check if input is a special command
 */
export function isSpecialCommand(input: string): boolean {
  const command = input.toLowerCase().trim();
  return ['help', 'clear', 'reset', 'exit', 'quit'].includes(command);
}

/**
 * Handle special commands
 * Returns: { shouldContinue: boolean, newState?: AgentStateType | null }
 */
export function handleCommand(
  input: string, 
  currentState: AgentStateType | null
): { shouldContinue: boolean; newState?: AgentStateType | null; shouldExit?: boolean } {
  const command = input.toLowerCase().trim();

  switch (command) {
    case 'help':
      displayHelp();
      return { shouldContinue: false };

    case 'clear':
    case 'reset':
      console.log("\n🔄 Conversation cleared!\n");
      return { shouldContinue: false, newState: null };

    case 'exit':
    case 'quit':
      console.log("\n👋 Goodbye!\n");
      return { shouldContinue: false, shouldExit: true };

    default:
      return { shouldContinue: true };
  }
}
