// Person profile from LinkedIn search
export interface Person {
  profileUrl: string;
  profileId: string;
  profileUrn?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  headline: string;
  currentPosition?: string;
  company: string;
  location: string;
  connectionDegree?: string;
  isPremium?: boolean;
  isOpenToWork?: boolean;
  profilePicture?: string;
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

export interface ApiPerson {
  profileUrl?: string;
  profileId?: string;
  profileUrn?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  currentPosition?: string;
  location?: string;
  connectionDegree?: string;
  isPremium?: boolean;
  isOpenToWork?: boolean;
  profilePicture?: string;
}

export interface ApiResponse {
  success?: boolean;
  people?: ApiPerson[];
  pagination?: Record<string, unknown>;
  hasMore?: boolean;
  error?: string;
}