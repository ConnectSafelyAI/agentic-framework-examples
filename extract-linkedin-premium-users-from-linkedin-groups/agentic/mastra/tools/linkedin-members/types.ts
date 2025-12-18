// ============================================================================
// SHARED TYPE DEFINITIONS
// ============================================================================

export interface GroupMember {
  profileId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  publicIdentifier: string;
  profileUrl: string;
  followerCount: number;
  isPremium: boolean;
  isVerified: boolean;
  badges: string[];
  relationshipStatus: string;
  creator: boolean;
}

export interface GroupMembersResponse {
  members: GroupMember[];
  hasMore: boolean;
}

