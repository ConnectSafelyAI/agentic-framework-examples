import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Person profile from LinkedIn search
export interface Person {
  profileUrl: string;
  profileId: string;
  profileUrn: string;
  fullName: string;
  firstName: string;
  lastName: string;
  headline: string;
  currentPosition: string;
  company: string;
  location: string;
  connectionDegree: string;
  isPremium: boolean;
  isOpenToWork: boolean;
  profilePicture: string;
}

// Geographic location
export interface GeoLocation {
  id: string;
  geoId?: string;
  name: string;
  country?: string;
}

// Search parameters
export interface SearchParams {
  keywords: string;
  location?: string;
  title?: string;
  limit: number;
}

// Export result
export interface ExportResult {
  success: boolean;
  rowsExported?: number;
  filePath?: string;
  spreadsheetUrl?: string;
  error?: string;
}

// Agent state for LangGraph
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  searchResults: Annotation<Person[]>({
    reducer: (_curr, update) => update,
    default: () => [],
  }),
  searchParams: Annotation<SearchParams | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
  lastExport: Annotation<ExportResult | null>({
    reducer: (_curr, update) => update,
    default: () => null,
  }),
});

export type AgentStateType = typeof AgentState.State;
