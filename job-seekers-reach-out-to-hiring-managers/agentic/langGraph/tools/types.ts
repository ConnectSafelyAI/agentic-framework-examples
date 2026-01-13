import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Job Search Types
export interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    name: string;
    universalName?: string;
  };
  companyId?: string;
  companyName?: string;
  location?: string;
  description?: string;
}

export interface Person {
  profileId: string;
  publicIdentifier?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  profileUrl?: string;
  currentCompany?: {
    id: string;
    name: string;
  };
}

export interface Profile {
  profileId: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration?: string;
  }>;
}

export interface RelationshipStatus {
  connected: boolean;
  invitationSent: boolean;
  invitationReceived: boolean;
}

// Agent State using LangGraph's Annotation
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

  // Job search state
  locationId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  jobs: Annotation<Job[] | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  hiringManagers: Annotation<Person[] | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  profileDetails: Annotation<Profile | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  connectionStatus: Annotation<RelationshipStatus | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  // Metadata
  totalJobsFound: Annotation<number | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  totalManagersFound: Annotation<number | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  connectionRequestsSent: Annotation<number | undefined>({
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