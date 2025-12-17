import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GroupMember {
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

interface GroupMembersResponse {
  members: GroupMember[];
  hasMore: boolean;
}

interface ProcessedMember {
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
  badges: string;
  relationshipStatus: string;
  creator: boolean;
  fetchedAt: string;
}

// ============================================================================
// TOOL 1: FETCH GROUP MEMBERS (with pagination)
// ============================================================================

export const premiumMembersTool = createTool({
  id: "fetch-linkedin-group-members",
  description:
    "Fetch members from a LinkedIn group with pagination support. Retrieves member profiles including premium/verified status, headlines, and relationship information.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe('LinkedIn group ID (e.g., "9357376")'),
    count: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Number of members per request (max 100)"),
    start: z
      .number()
      .min(0)
      .default(0)
      .describe("Pagination offset - starting position"),
  }),
  outputSchema: z.object({
    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
        publicIdentifier: z.string(),
        profileUrl: z.string(),
        followerCount: z.number(),
        isPremium: z.boolean(),
        isVerified: z.boolean(),
        badges: z.array(z.string()),
        relationshipStatus: z.string(),
        creator: z.boolean(),
      })
    ),
    hasMore: z.boolean(),
    fetchedCount: z.number(),
  }),
  execute: async ({ context }) => {
    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: context.groupId,
          count: context.count,
          start: context.start,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    const data = (await response.json()) as GroupMembersResponse;

    return {
      members: data.members,
      hasMore: data.hasMore,
      fetchedCount: data.members.length,
    };
  },
});

// ============================================================================
// TOOL 2: FETCH ALL GROUP MEMBERS (handles pagination automatically)
// ============================================================================

export const fetchAllGroupMembersTool = createTool({
  id: "fetch-all-linkedin-group-members",
  description:
    "Fetch ALL members from a LinkedIn group by automatically handling pagination. Will continue fetching until all members are retrieved.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe("LinkedIn group ID"),
    batchSize: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Members per API request"),
    maxMembers: z
      .number()
      .optional()
      .describe("Maximum members to fetch (optional limit)"),
  }),
  outputSchema: z.object({
    allMembers: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
        publicIdentifier: z.string(),
        profileUrl: z.string(),
        followerCount: z.number(),
        isPremium: z.boolean(),
        isVerified: z.boolean(),
        badges: z.array(z.string()),
        relationshipStatus: z.string(),
        creator: z.boolean(),
      })
    ),
    totalFetched: z.number(),
    requestsMade: z.number(),
  }),
  execute: async ({ context }) => {
    const allMembers: GroupMember[] = [];
    let start = 0;
    let hasMore = true;
    let requestsMade = 0;

    while (hasMore) {
      // Check if we've hit the max limit
      if (context.maxMembers && allMembers.length >= context.maxMembers) {
        break;
      }

      const response = await fetch(
        "https://api.connectsafely.ai/linkedin/groups/members",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: context.groupId,
            count: context.batchSize,
            start: start,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch group members: ${response.statusText}`
        );
      }

      const data = (await response.json()) as GroupMembersResponse;
      allMembers.push(...data.members);
      hasMore = data.hasMore;
      start += context.batchSize;
      requestsMade++;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return {
      allMembers,
      totalFetched: allMembers.length,
      requestsMade,
    };
  },
});

// ============================================================================
// TOOL 3: FILTER PREMIUM & VERIFIED MEMBERS
// ============================================================================

export const filterPremiumVerifiedMembersTool = createTool({
  id: "filter-premium-verified-members",
  description:
    "Filter LinkedIn group members to only include Premium or Verified profiles. Checks isPremium, isVerified flags and badge arrays.",
  inputSchema: z.object({
    members: z
      .array(
        z.object({
          profileId: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          fullName: z.string(),
          headline: z.string(),
          publicIdentifier: z.string(),
          profileUrl: z.string(),
          followerCount: z.number(),
          isPremium: z.boolean(),
          isVerified: z.boolean(),
          badges: z.array(z.string()),
          relationshipStatus: z.string(),
          creator: z.boolean(),
        })
      )
      .describe("Array of group members to filter"),
  }),
  outputSchema: z.object({
    filteredMembers: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
        publicIdentifier: z.string(),
        profileUrl: z.string(),
        followerCount: z.number(),
        isPremium: z.boolean(),
        isVerified: z.boolean(),
        badges: z.string(),
        relationshipStatus: z.string(),
        creator: z.boolean(),
        fetchedAt: z.string(),
      })
    ),
    totalFiltered: z.number(),
    originalCount: z.number(),
  }),
  execute: async ({ context }) => {
    const filteredMembers = context.members.filter((member) => {
      const isPremium = member.isPremium === true;
      const isVerified = member.isVerified === true;
      const hasPremiumBadge =
        member.badges && member.badges.includes("premium");
      const hasVerifiedBadge =
        member.badges && member.badges.includes("verified");

      return isPremium || isVerified || hasPremiumBadge || hasVerifiedBadge;
    });

    const processedMembers: ProcessedMember[] = filteredMembers.map(
      (member) => ({
        profileId: member.profileId,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: member.fullName,
        headline: member.headline,
        publicIdentifier: member.publicIdentifier,
        profileUrl: member.profileUrl,
        followerCount: member.followerCount,
        isPremium: member.isPremium,
        isVerified: member.isVerified,
        badges: member.badges ? member.badges.join(", ") : "",
        relationshipStatus: member.relationshipStatus,
        creator: member.creator,
        fetchedAt: new Date().toISOString(),
      })
    );

    return {
      filteredMembers: processedMembers,
      totalFiltered: processedMembers.length,
      originalCount: context.members.length,
    };
  },
});

// ============================================================================
// TOOL 4: EXPORT TO GOOGLE SHEETS
// ============================================================================

export const exportToGoogleSheetsTool = createTool({
  id: "export-members-to-google-sheets",
  description:
    "Export LinkedIn group members to Google Sheets. Appends or updates rows based on Profile ID.",
  inputSchema: z.object({
    members: z
      .array(
        z.object({
          profileId: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          fullName: z.string(),
          headline: z.string(),
          publicIdentifier: z.string(),
          profileUrl: z.string(),
          followerCount: z.number(),
          isPremium: z.boolean(),
          isVerified: z.boolean(),
          badges: z.string(),
          relationshipStatus: z.string(),
        })
      )
      .describe("Array of processed members to export"),
    spreadsheetId: z.string().describe("Google Sheets spreadsheet ID"),
    sheetName: z.string().describe("Sheet name/tab within the spreadsheet"),
    accessToken: z.string().describe("Google OAuth2 access token"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    rowsAdded: z.number(),
    spreadsheetUrl: z.string(),
  }),
  execute: async ({ context }) => {
    // Get current sheet data to check for existing profiles
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}`,
      {
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to read sheet: ${getResponse.statusText}`);
    }

    const sheetData = await getResponse.json();
    const existingRows = sheetData.values || [];
    const existingProfileIds = new Set(
      existingRows.slice(1).map((row: string[]) => row[0])
    );

    // Prepare rows to append
    const rowsToAppend = context.members
      .filter((member) => !existingProfileIds.has(member.profileId))
      .map((member) => [
        member.profileId,
        member.firstName,
        member.lastName,
        member.fullName,
        member.headline,
        member.publicIdentifier,
        member.profileUrl,
        member.followerCount,
        member.isPremium,
        member.isVerified,
        member.badges,
        member.relationshipStatus,
      ]);

    if (rowsToAppend.length === 0) {
      return {
        success: true,
        rowsAdded: 0,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${context.spreadsheetId}`,
      };
    }

    // Append new rows
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: rowsToAppend,
        }),
      }
    );

    if (!appendResponse.ok) {
      throw new Error(
        `Failed to append to sheet: ${appendResponse.statusText}`
      );
    }

    return {
      success: true,
      rowsAdded: rowsToAppend.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${context.spreadsheetId}`,
    };
  },
});

// ============================================================================
// TOOL 5: COMPLETE WORKFLOW (fetch + filter + export)
// ============================================================================

export const completeGroupMembersWorkflowTool = createTool({
  id: "complete-group-members-workflow",
  description:
    "Complete workflow: Fetch all LinkedIn group members, filter for Premium/Verified, and export to Google Sheets in one operation.",
  inputSchema: z.object({
    // ConnectSafely API
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupId: z.string().describe("LinkedIn group ID"),
    batchSize: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Members per API request"),

    // Google Sheets
    spreadsheetId: z.string().describe("Google Sheets spreadsheet ID"),
    sheetName: z.string().describe("Sheet name/tab"),
    googleAccessToken: z.string().describe("Google OAuth2 access token"),

    // Options
    filterPremiumOnly: z
      .boolean()
      .default(true)
      .describe("Only include Premium/Verified members"),
    maxMembers: z
      .number()
      .optional()
      .describe("Max members to fetch (optional)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    totalFetched: z.number(),
    totalFiltered: z.number(),
    rowsExported: z.number(),
    requestsMade: z.number(),
    spreadsheetUrl: z.string(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Step 1: Fetch all members with pagination
    const allMembers: GroupMember[] = [];
    let start = 0;
    let hasMore = true;
    let requestsMade = 0;

    while (hasMore) {
      if (context.maxMembers && allMembers.length >= context.maxMembers) {
        break;
      }

      const response = await fetch(
        "https://api.connectsafely.ai/linkedin/groups/members",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: context.groupId,
            count: context.batchSize,
            start: start,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch group members: ${response.statusText}`
        );
      }

      const data = (await response.json()) as GroupMembersResponse;
      allMembers.push(...data.members);
      hasMore = data.hasMore;
      start += context.batchSize;
      requestsMade++;

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 2: Filter for Premium/Verified members
    let membersToExport = allMembers;

    if (context.filterPremiumOnly) {
      membersToExport = allMembers.filter((member) => {
        const isPremium = member.isPremium === true;
        const isVerified = member.isVerified === true;
        const hasPremiumBadge =
          member.badges && member.badges.includes("premium");
        const hasVerifiedBadge =
          member.badges && member.badges.includes("verified");

        return isPremium || isVerified || hasPremiumBadge || hasVerifiedBadge;
      });
    }

    // Process members for export
    const processedMembers = membersToExport.map((member) => ({
      profileId: member.profileId,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: member.fullName,
      headline: member.headline,
      publicIdentifier: member.publicIdentifier,
      profileUrl: member.profileUrl,
      followerCount: member.followerCount,
      isPremium: member.isPremium,
      isVerified: member.isVerified,
      badges: member.badges ? member.badges.join(", ") : "",
      relationshipStatus: member.relationshipStatus,
    }));

    // Step 3: Export to Google Sheets
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}`,
      {
        headers: {
          Authorization: `Bearer ${context.googleAccessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to read sheet: ${getResponse.statusText}`);
    }

    const sheetData = await getResponse.json();
    const existingRows = sheetData.values || [];
    const existingProfileIds = new Set(
      existingRows.slice(1).map((row: string[]) => row[0])
    );

    const rowsToAppend = processedMembers
      .filter((member) => !existingProfileIds.has(member.profileId))
      .map((member) => [
        member.profileId,
        member.firstName,
        member.lastName,
        member.fullName,
        member.headline,
        member.publicIdentifier,
        member.profileUrl,
        member.followerCount,
        member.isPremium,
        member.isVerified,
        member.badges,
        member.relationshipStatus,
      ]);

    let rowsExported = 0;

    if (rowsToAppend.length > 0) {
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rowsToAppend,
          }),
        }
      );

      if (!appendResponse.ok) {
        throw new Error(
          `Failed to append to sheet: ${appendResponse.statusText}`
        );
      }

      rowsExported = rowsToAppend.length;
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${context.spreadsheetId}`;
    const summary = `Fetched ${allMembers.length} members, filtered to ${processedMembers.length} Premium/Verified profiles, exported ${rowsExported} new rows to Google Sheets`;

    return {
      success: true,
      totalFetched: allMembers.length,
      totalFiltered: processedMembers.length,
      rowsExported,
      requestsMade,
      spreadsheetUrl,
      summary,
    };
  },
});

// ============================================================================
// TOOL 6: GET GROUP MEMBER BY URL
// ============================================================================

export const getGroupMembersByUrlTool = createTool({
  id: "get-group-members-by-url",
  description:
    "Fetch LinkedIn group members using the group URL instead of ID. Automatically extracts group ID from URL.",
  inputSchema: z.object({
    apiToken: z.string().describe("ConnectSafely.ai API bearer token"),
    groupUrl: z
      .string()
      .url()
      .describe(
        "LinkedIn group URL (e.g., https://www.linkedin.com/groups/9357376/)"
      ),
    count: z
      .number()
      .min(1)
      .max(100)
      .default(50)
      .describe("Number of members per request"),
    start: z.number().min(0).default(0).describe("Pagination offset"),
  }),
  outputSchema: z.object({
    members: z.array(
      z.object({
        profileId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        fullName: z.string(),
        headline: z.string(),
      })
    ),
    hasMore: z.boolean(),
    groupId: z.string(),
  }),
  execute: async ({ context }) => {
    // Extract group ID from URL
    const groupIdMatch = context.groupUrl.match(/groups\/(\d+)/);
    if (!groupIdMatch) {
      throw new Error("Invalid group URL - could not extract group ID");
    }
    const groupId = groupIdMatch[1];

    const response = await fetch(
      "https://api.connectsafely.ai/linkedin/groups/members",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          count: context.count,
          start: context.start,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    const data = (await response.json()) as GroupMembersResponse;

    return {
      members: data.members,
      hasMore: data.hasMore,
      groupId,
    };
  },
});

// ============================================================================
// TOOL 7: CREATE GOOGLE SHEET
// ============================================================================

export const createGoogleSheetTool = createTool({
  id: "create-google-sheet",
  description:
    "Create a new Google Spreadsheet with custom sheet name and optional header row. Perfect for creating sheets for LinkedIn group member data.",
  inputSchema: z.object({
    accessToken: z
      .string()
      .describe("Google OAuth2 access token"),
    spreadsheetTitle: z
      .string()
      .describe(
        'Title of the new spreadsheet (e.g., "LinkedIn Group Members - 2024")'
      ),
    sheetName: z
      .string()
      .default("Sheet1")
      .describe("Name of the first sheet/tab"),
    includeHeaders: z
      .boolean()
      .default(true)
      .describe("Add header row for LinkedIn member data"),
    customHeaders: z
      .array(z.string())
      .optional()
      .describe("Custom header row (if not using default LinkedIn headers)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    spreadsheetId: z.string(),
    spreadsheetUrl: z.string(),
    sheetId: z.number(),
    sheetName: z.string(),
    headersAdded: z.boolean(),
  }),
  execute: async ({ context }) => {
    // Default headers for LinkedIn group members
    const defaultHeaders = [
      "Profile ID",
      "First Name",
      "Last Name",
      "Full Name",
      "Headline",
      "Public Identifier",
      "Profile URL",
      "Follower Count",
      "Is Premium",
      "Is Verified",
      "Badges",
      "Relationship Status",
    ];

    const headers =
      context.customHeaders || (context.includeHeaders ? defaultHeaders : []);

    // Create the spreadsheet
    const createResponse = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: context.spreadsheetTitle,
          },
          sheets: [
            {
              properties: {
                title: context.sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: headers.length > 0 ? headers.length : 12,
                  frozenRowCount: context.includeHeaders ? 1 : 0,
                },
              },
            },
          ],
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(
        `Failed to create spreadsheet: ${createResponse.statusText} - ${errorText}`
      );
    }

    const spreadsheetData = await createResponse.json();
    const spreadsheetId = spreadsheetData.spreadsheetId;
    const sheetId = spreadsheetData.sheets[0].properties.sheetId;
    const spreadsheetUrl = spreadsheetData.spreadsheetUrl;

    let headersAdded = false;

    // Add headers if requested
    if (context.includeHeaders && headers.length > 0) {
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [headers],
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Failed to add headers: ${updateResponse.statusText}`);
      }

      // Format header row (bold, frozen)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9,
                      },
                      textFormat: {
                        bold: true,
                      },
                    },
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat)",
                },
              },
            ],
          }),
        }
      );

      headersAdded = true;
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      sheetId,
      sheetName: context.sheetName,
      headersAdded,
    };
  },
});

// ============================================================================
// TOOL 8: ADD DATA TO GOOGLE SHEET (Generic)
// ============================================================================

export const addDataToGoogleSheetTool = createTool({
  id: "add-data-to-google-sheet",
  description:
    "Add rows of data to an existing Google Sheet. Supports both append and update modes with duplicate detection.",
  inputSchema: z.object({
    accessToken: z.string().describe("Google OAuth2 access token"),
    spreadsheetId: z.string().describe("Google Sheets spreadsheet ID"),
    sheetName: z.string().describe("Sheet name/tab"),
    data: z
      .array(z.array(z.union([z.string(), z.number(), z.boolean()])))
      .describe("2D array of data to add [[row1], [row2], ...]"),
    mode: z
      .enum(["append", "update", "appendOrUpdate"])
      .default("append")
      .describe(
        "How to add data: append (always add), update (only update existing), appendOrUpdate (add if new, update if exists)"
      ),
    uniqueColumnIndex: z
      .number()
      .default(0)
      .describe(
        "Column index (0-based) to use for duplicate detection in update modes"
      ),
    startRow: z
      .number()
      .optional()
      .describe("Optional: Start from specific row (for append mode)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    rowsProcessed: z.number(),
    rowsAdded: z.number(),
    rowsUpdated: z.number(),
    spreadsheetUrl: z.string(),
    range: z.string(),
  }),
  execute: async ({ context }) => {
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${context.spreadsheetId}`;

    // If mode is append, just append the data
    if (context.mode === "append") {
      const range = context.startRow
        ? `${context.sheetName}!A${context.startRow}`
        : `${context.sheetName}`;

      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: context.data,
          }),
        }
      );

      if (!appendResponse.ok) {
        throw new Error(`Failed to append data: ${appendResponse.statusText}`);
      }

      const result = await appendResponse.json();

      return {
        success: true,
        rowsProcessed: context.data.length,
        rowsAdded: context.data.length,
        rowsUpdated: 0,
        spreadsheetUrl,
        range: result.updates?.updatedRange || range,
      };
    }

    // For update or appendOrUpdate modes, need to check existing data
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}`,
      {
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to read sheet: ${getResponse.statusText}`);
    }

    const sheetData = await getResponse.json();
    const existingRows = sheetData.values || [];

    // Create a map of existing values by unique column
    const existingMap = new Map<string, number>();
    existingRows.forEach((row: any[], index: number) => {
      if (row[context.uniqueColumnIndex] !== undefined) {
        existingMap.set(String(row[context.uniqueColumnIndex]), index);
      }
    });

    const rowsToAppend: any[][] = [];
    const rowsToUpdate: Array<{ row: any[]; rowIndex: number }> = [];

    // Categorize data
    context.data.forEach((row) => {
      const uniqueValue = String(row[context.uniqueColumnIndex]);
      const existingRowIndex = existingMap.get(uniqueValue);

      if (existingRowIndex !== undefined) {
        // Row exists - update if mode allows
        if (context.mode === "update" || context.mode === "appendOrUpdate") {
          rowsToUpdate.push({ row, rowIndex: existingRowIndex });
        }
      } else {
        // Row doesn't exist - append if mode allows
        if (context.mode === "appendOrUpdate") {
          rowsToAppend.push(row);
        }
      }
    });

    let rowsAdded = 0;
    let rowsUpdated = 0;

    // Append new rows
    if (rowsToAppend.length > 0) {
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rowsToAppend,
          }),
        }
      );

      if (!appendResponse.ok) {
        throw new Error(
          `Failed to append new rows: ${appendResponse.statusText}`
        );
      }

      rowsAdded = rowsToAppend.length;
    }

    // Update existing rows
    if (rowsToUpdate.length > 0) {
      const updateRequests = rowsToUpdate.map(({ row, rowIndex }) => ({
        range: `${context.sheetName}!A${rowIndex + 1}`,
        values: [row],
      }));

      const batchUpdateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${context.spreadsheetId}/values:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            valueInputOption: "USER_ENTERED",
            data: updateRequests,
          }),
        }
      );

      if (!batchUpdateResponse.ok) {
        throw new Error(
          `Failed to update rows: ${batchUpdateResponse.statusText}`
        );
      }

      rowsUpdated = rowsToUpdate.length;
    }

    return {
      success: true,
      rowsProcessed: context.data.length,
      rowsAdded,
      rowsUpdated,
      spreadsheetUrl,
      range: context.sheetName,
    };
  },
});

// ============================================================================
// TOOL 9: CREATE SHEET AND ADD LINKEDIN MEMBERS (Complete Flow)
// ============================================================================

export const createSheetAndAddMembersTool = createTool({
  id: "create-sheet-and-add-members",
  description:
    "Complete workflow: Create a new Google Sheet with proper headers and add LinkedIn group member data in one operation.",
  inputSchema: z.object({
    // Google Sheets
    accessToken: z.string().describe("Google OAuth2 access token"),
    spreadsheetTitle: z.string().describe("Title for the new spreadsheet"),
    sheetName: z
      .string()
      .default("LinkedIn Members")
      .describe("Name of the sheet/tab"),

    // Member data
    members: z
      .array(
        z.object({
          profileId: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          fullName: z.string(),
          headline: z.string(),
          publicIdentifier: z.string(),
          profileUrl: z.string(),
          followerCount: z.number(),
          isPremium: z.boolean(),
          isVerified: z.boolean(),
          badges: z.string(),
          relationshipStatus: z.string(),
        })
      )
      .describe("Array of LinkedIn members to add"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    spreadsheetId: z.string(),
    spreadsheetUrl: z.string(),
    sheetName: z.string(),
    membersAdded: z.number(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Step 1: Create the spreadsheet with headers
    const headers = [
      "Profile ID",
      "First Name",
      "Last Name",
      "Full Name",
      "Headline",
      "Public Identifier",
      "Profile URL",
      "Follower Count",
      "Is Premium",
      "Is Verified",
      "Badges",
      "Relationship Status",
    ];

    const createResponse = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: context.spreadsheetTitle,
          },
          sheets: [
            {
              properties: {
                title: context.sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 12,
                  frozenRowCount: 1,
                },
              },
            },
          ],
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error(
        `Failed to create spreadsheet: ${createResponse.statusText}`
      );
    }

    const spreadsheetData = await createResponse.json();
    const spreadsheetId = spreadsheetData.spreadsheetId;
    const sheetId = spreadsheetData.sheets[0].properties.sheetId;
    const spreadsheetUrl = spreadsheetData.spreadsheetUrl;

    // Step 2: Add headers
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [headers],
        }),
      }
    );

    // Step 3: Format header row
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.2,
                      green: 0.5,
                      blue: 0.9,
                    },
                    textFormat: {
                      bold: true,
                      foregroundColor: {
                        red: 1,
                        green: 1,
                        blue: 1,
                      },
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
          ],
        }),
      }
    );

    // Step 4: Add member data
    const memberRows = context.members.map((member) => [
      member.profileId,
      member.firstName,
      member.lastName,
      member.fullName,
      member.headline,
      member.publicIdentifier,
      member.profileUrl,
      member.followerCount,
      member.isPremium,
      member.isVerified,
      member.badges,
      member.relationshipStatus,
    ]);

    if (memberRows.length > 0) {
      const addDataResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${context.sheetName}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: memberRows,
          }),
        }
      );

      if (!addDataResponse.ok) {
        throw new Error(
          `Failed to add member data: ${addDataResponse.statusText}`
        );
      }
    }

    const summary = `Created spreadsheet "${context.spreadsheetTitle}" with ${context.members.length} LinkedIn group members`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      sheetName: context.sheetName,
      membersAdded: context.members.length,
      summary,
    };
  },
});
