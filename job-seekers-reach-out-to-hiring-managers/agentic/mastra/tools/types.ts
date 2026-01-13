export interface GeoLocation {
    id: string;
    name: string;
    country?: string;
  }
  
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
  
  export interface Company {
    id: string;
    name: string;
    universalName?: string;
    description?: string;
    website?: string;
    industry?: string;
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