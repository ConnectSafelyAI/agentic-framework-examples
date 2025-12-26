import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// LinkedIn Member Type
export interface LinkedInMember {
  profileId: string;
  name: string;
  headline?: string;
  location?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  badges?: string[];
  profileUrl?: string;
  fetchedAt?: string;
}

// Tool result types
export interface FetchMembersResult {
  totalFetched: number;
  members: LinkedInMember[];
  hasMore?: boolean;
}

export interface FilterMembersResult {
  totalInput: number;
  totalFiltered: number;
  members: LinkedInMember[];
}

export interface GoogleSheetsResult {
  spreadsheetUrl: string;
  rowsWritten: number;
}

// Agent State using LangGraph's Annotation
// This is the latest pattern from LangGraph v0.2.x
export const AgentState = Annotation.Root({
  // Messages - LangGraph manages message history automatically
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  // User input
  userInput: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  groupId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  groupUrl: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  // Data storage
  members: Annotation<LinkedInMember[] | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  premiumMembers: Annotation<LinkedInMember[] | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  // Metadata
  totalFetched: Annotation<number | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  totalFiltered: Annotation<number | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  spreadsheetUrl: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  // Control flow
  nextStep: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  error: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),
});

// Export the state type for use in functions
export type AgentStateType = typeof AgentState.State;