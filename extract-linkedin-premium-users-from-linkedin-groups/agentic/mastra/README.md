# LinkedIn Group Premium Member Extractor

An intelligent AI agent built with [Mastra](https://mastra.ai) that automates the extraction of Premium and Verified LinkedIn group members using the [ConnectSafely.ai](https://connectsafely.ai) API. This agent enables sales professionals, community managers, recruiters, and growth marketers to identify high-quality leads from LinkedIn groups without manual effort.

## 🎯 Purpose

This project provides an **AI-powered agent** that can:

- **Extract LinkedIn Group Members**: Fetch members from any LinkedIn group you're a member of via ConnectSafely.ai API
- **Filter Premium & Verified Profiles**: Automatically identify decision-makers, founders, and verified professionals
- **Handle Pagination Automatically**: Process groups of any size (from 500 to 50,000+ members) with intelligent pagination
- **Export to Google Sheets**: Seamlessly export filtered member data to Google Spreadsheets
- **Complete Workflows**: Execute end-to-end automation from extraction to export in a single operation

### Use Cases

- **Sales Prospecting**: Build targeted prospect lists from industry-specific groups with verified decision-makers
- **Competitor Research**: Analyze who's active in competitor communities and their professional backgrounds
- **Influencer Identification**: Find Premium creators and verified professionals for partnership opportunities
- **Recruiting**: Source passive candidates who are active in professional development groups
- **Event Marketing**: Identify engaged professionals in niche communities for webinar and conference promotion
- **Content Strategy**: Research headlines and titles to understand what resonates in your industry

---

## 🔌 ConnectSafely.ai Integration

This agent is built entirely on top of the **ConnectSafely.ai API**, which provides secure and reliable access to LinkedIn group data. ConnectSafely.ai handles all the complexity of LinkedIn API interactions, authentication, and data normalization.

### Why ConnectSafely.ai?

ConnectSafely.ai is a specialized platform that:
- **Simplifies LinkedIn Automation**: No need to manage LinkedIn API credentials directly
- **Provides Reliable Access**: Handles rate limiting, authentication, and API changes automatically
- **Ensures Data Quality**: Returns normalized, structured data with Premium/Verified status indicators
- **Scales Efficiently**: Built to handle large-scale member extraction from LinkedIn groups

### ConnectSafely.ai API Overview

#### API Endpoint

All member extraction requests are made to:

```
POST https://api.connectsafely.ai/linkedin/groups/members
```

#### Authentication

ConnectSafely.ai uses **Bearer Token Authentication**. The agent automatically includes your API token in all requests:

```typescript
headers: {
  Authorization: `Bearer ${process.env.CONNECTSAFELY_API_TOKEN}`,
  "Content-Type": "application/json",
}
```

#### Obtaining Your ConnectSafely.ai API Key

1. Sign up at [ConnectSafely.ai](https://connectsafely.ai)
2. Navigate to **Settings** → **API Keys** in your dashboard
3. Generate a new API key
4. Add it to your `.env` file as `CONNECTSAFELY_API_TOKEN`

#### API Request Format

The agent sends requests in this format:

```json
{
  "groupId": "9357376",
  "count": 50,
  "start": 0
}
```

**Parameters:**
- `groupId` (string, required): LinkedIn group ID (found in the group URL: `linkedin.com/groups/XXXXXXX/`)
- `count` (number, optional): Number of members per request (1-100, default: 50)
- `start` (number, optional): Pagination offset - starting position (default: 0)

#### API Response Format

ConnectSafely.ai returns structured member data:

```typescript
{
  members: [
    {
      profileId: string;
      firstName: string;
      lastName: string;
      fullName: string;
      headline: string;
      publicIdentifier: string;
      profileUrl: string;
      followerCount: number;
      isPremium: boolean;        // Premium subscription indicator
      isVerified: boolean;       // Verified profile indicator
      badges: string[];          // Array of badges (e.g., ["premium", "verified"])
      relationshipStatus: string;
      creator: boolean;
    }
  ],
  hasMore: boolean;              // Indicates if more members are available
}
```

#### ConnectSafely.ai Features Used

The agent leverages these ConnectSafely.ai capabilities:

1. **Group Member Extraction**: Fetches member profiles from LinkedIn groups you're a member of
2. **Pagination Support**: Handles large groups with automatic pagination via `hasMore` flag
3. **Premium/Verified Status**: Identifies Premium subscribers and verified profiles via `isPremium`, `isVerified`, and `badges` fields
4. **Profile Metadata**: Retrieves comprehensive profile information including headlines, follower counts, and relationship status
5. **Reliable Data Structure**: Consistent, normalized data format across all responses

#### Rate Limits & Best Practices

- Maximum `count` per request: **100 members**
- The API handles pagination automatically via the `hasMore` flag
- **Important**: You must be a member of the target LinkedIn group (ConnectSafely.ai can only access groups you've joined)
- For large groups, the agent automatically handles pagination to fetch all members
- The agent uses a batch size of 50 members per request for optimal performance

---

## 🤖 How the Agent Works

The **LinkedIn Group Premium Member Extractor** is an AI agent powered by Google's Gemini 2.5 Flash model. It uses a set of specialized tools to interact with the ConnectSafely.ai API and Google Sheets.

### Agent Architecture

```
User Query
    ↓
AI Agent (Gemini 2.5 Flash)
    ↓
Tool Selection & Execution
    ↓
ConnectSafely.ai API → LinkedIn Groups
    ↓
Data Processing & Filtering
    ↓
Google Sheets (Optional)
    ↓
Response to User
```

### Agent Capabilities

The agent can:
- **Understand natural language queries** (e.g., "fetch 10 premium members from group 9357376")
- **Automatically select the right tools** for the task
- **Handle pagination** without manual intervention
- **Filter for Premium/Verified members** intelligently
- **Export to Google Sheets** when requested
- **Remember context** across multiple interactions

### Available Tools

The agent has access to 6 specialized tools:

1. **`fetchLinkedInGroupMembersTool`** - Fetch a single paginated batch (low-level control)
2. **`fetchAllLinkedInGroupMembersTool`** - Fetch ALL members with automatic pagination
3. **`fetchGroupMembersByUrlTool`** - Resolve LinkedIn group URL to groupId
4. **`filterPremiumVerifiedMembersTool`** - Filter members for Premium/Verified profiles
5. **`completeGroupMembersWorkflowTool`** - End-to-end: fetch + filter Premium/Verified members
6. **`googleSheetsTool`** - Create or update Google Sheets with member data

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** >= 22.13.0
- **ConnectSafely.ai API Key** - Get yours at [connectsafely.ai](https://connectsafely.ai)
- **Google OAuth Credentials** (optional, for Google Sheets export):
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`

### Installation

1. **Clone and navigate to the project**:

   ```bash
   cd extract-linkedin-premium-users-from-linkedin-groups/agentic/mastra
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the project root:

   ```env
   # ConnectSafely.ai API Token (Required)
   CONNECTSAFELY_API_TOKEN=your_connectsafely_api_token_here

   # Google OAuth (Optional, for Google Sheets)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   ```

---

## 🚀 Usage

Run directly with Bun (no build step required):

```bash
# Interactive mode (REPL)
bun run agent.ts
# or
bun start

# Non-interactive mode (one command)
bun run agent.ts "fetch 10 premium members from group 9357376"
# or
bun start -- "fetch 10 premium members from group 9357376"
```

### Example Queries

The agent understands natural language queries:

```
> fetch 10 premium members from group 9357376
> get all verified members from group 9357376 and save to Google Sheets
> extract premium members from https://www.linkedin.com/groups/9357376/
> fetch 50 members from group 9357376 and add them to a new spreadsheet
```

---

## 📋 Available Tools

### 1. Complete Group Members Workflow (`complete-group-members-workflow`)

**Purpose**: End-to-end workflow that fetches all LinkedIn group members via ConnectSafely.ai API and returns only Premium or Verified profiles. This is the **recommended tool** for most use cases.

**How it works with ConnectSafely.ai**:
- Makes multiple API calls to `https://api.connectsafely.ai/linkedin/groups/members`
- Handles pagination automatically using the `hasMore` flag from ConnectSafely.ai responses
- Filters members in real-time as they're fetched
- Uses `CONNECTSAFELY_API_TOKEN` from environment variables

**Input Parameters**:
- `groupId` (string, required): LinkedIn group ID
- `maxMembers` (number, optional): Limit on number of members to fetch

**Output**:
```typescript
{
  groupId: string;
  totalFetched: number;
  totalPremiumVerified: number;
  members: Array<{
    profileId: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    headline?: string;
    publicIdentifier?: string;
    profileUrl?: string;
    followerCount?: number;
    isPremium?: boolean;
    isVerified?: boolean;
    badges?: string[];
    relationshipStatus?: string;
    creator?: boolean;
    fetchedAt?: string;
  }>;
}
```

**Filtering Logic**:
A member is included if ANY of these are true:
- `isPremium === true` (from ConnectSafely.ai response)
- `isVerified === true` (from ConnectSafely.ai response)
- `badges` array includes `"premium"` (from ConnectSafely.ai response)
- `badges` array includes `"verified"` (from ConnectSafely.ai response)

**Use Cases**:
- Quick extraction of premium/verified members
- Building lead lists
- One-command member extraction

---

### 2. Fetch All LinkedIn Group Members (`fetch-all-linkedin-group-members`)

**Purpose**: Fetch ALL members from a LinkedIn group using ConnectSafely.ai API with automatic pagination. Returns all members (not filtered).

**How it works with ConnectSafely.ai**:
- Continuously calls ConnectSafely.ai API until `hasMore` is `false`
- Uses batch size of 50 members per request
- Automatically increments `start` parameter for pagination
- Respects `maxMembers` limit if provided

**Input Parameters**:
- `groupId` (string, required): LinkedIn group ID
- `maxMembers` (number, optional): Maximum members to fetch

**Output**:
```typescript
{
  totalFetched: number;
  members: Array<LinkedInMember>;
}
```

**Use Cases**:
- Getting complete member lists
- Bulk data collection
- When you need all members (not just premium/verified)

---

### 3. Fetch LinkedIn Group Members (`fetch-linkedin-group-members`)

**Purpose**: Fetch a single paginated batch of members from ConnectSafely.ai API. Provides fine-grained control over pagination.

**How it works with ConnectSafely.ai**:
- Makes a single API call to ConnectSafely.ai
- Returns one page of results
- Useful for testing or specific page extraction

**Input Parameters**:
- `groupId` (string, required): LinkedIn group ID
- `start` (number, required): Pagination offset
- `count` (number, required): Number of members per request (max 50)

**Output**:
```typescript
{
  members: Array<LinkedInMember>;
  hasMore: boolean;
  fetched: number;
}
```

**Use Cases**:
- Testing API connectivity
- Fetching specific pages
- Sampling members from a group

---

### 4. Fetch Group Members by URL (`fetch-group-members-by-url`)

**Purpose**: Resolve a LinkedIn group URL to a groupId, then fetch members. User-friendly interface when you only have the URL.

**How it works**:
- Extracts groupId from various LinkedIn URL formats
- Then uses ConnectSafely.ai API to fetch members

**Input Parameters**:
- `groupUrl` (string, required): LinkedIn group URL (e.g., "https://www.linkedin.com/groups/9357376/")

**Output**:
```typescript
{
  groupId: string;
}
```

**Use Cases**:
- When you only have the group URL
- User-friendly interface
- Quick extraction without manual ID lookup

---

### 5. Filter Premium/Verified Members (`filter-premium-verified-members`)

**Purpose**: Filter an array of members to only include Premium or Verified profiles. Uses the same logic as the complete workflow tool.

**Input Parameters**:
- `members` (array, required): Array of members to filter

**Output**:
```typescript
{
  totalInput: number;
  totalFiltered: number;
  members: Array<LinkedInMember>;
}
```

**Use Cases**:
- Post-processing fetched members
- Re-filtering existing data
- Combining with other tools

---

### 6. Google Sheets Tool (`google-sheets-members`)

**Purpose**: Create or update Google Sheets with LinkedIn member data. Automatically handles authentication and duplicate detection.

**How it works**:
- Automatically retrieves Google access token from environment variables or token generator
- Creates new spreadsheets or updates existing ones
- Detects duplicates by Profile ID
- Only adds new members

**Input Parameters**:
- `members` (array, required): Array of members to add
- `spreadsheetId` (string, optional): Existing spreadsheet ID (if updating)
- `spreadsheetTitle` (string, optional): Title for new spreadsheet
- `sheetName` (string, optional): Sheet name (default: "LinkedIn Members")

**Output**:
```typescript
{
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  sheetName: string;
  membersAdded: number;
  membersSkipped: number;
  isNewSheet: boolean;
  summary: string;
}
```

**Features**:
- Automatic duplicate detection by Profile ID
- Creates new sheets with formatted headers
- Updates existing sheets with new members only
- Returns spreadsheet URL for easy access

**Use Cases**:
- Exporting member data
- Building lead databases
- Sharing results with teams

---

## 🔄 Typical Workflows

### Workflow 1: Extract Premium Members Only

```
User: "fetch 10 premium members from group 9357376"
  ↓
Agent uses: completeGroupMembersWorkflowTool
  ↓
ConnectSafely.ai API calls (automatic pagination)
  ↓
Filtering for Premium/Verified (real-time)
  ↓
Returns: 10 premium/verified members
```

### Workflow 2: Extract and Export to Google Sheets

```
User: "get premium members from group 9357376 and save to Google Sheets"
  ↓
Agent uses: completeGroupMembersWorkflowTool
  ↓
ConnectSafely.ai API calls
  ↓
Filtering for Premium/Verified
  ↓
Agent uses: googleSheetsTool
  ↓
Creates/updates Google Sheet
  ↓
Returns: Spreadsheet URL and summary
```

### Workflow 3: Extract from Group URL

```
User: "extract members from https://www.linkedin.com/groups/9357376/"
  ↓
Agent uses: fetchGroupMembersByUrlTool
  ↓
Extracts groupId: "9357376"
  ↓
Agent uses: completeGroupMembersWorkflowTool
  ↓
Returns: Premium/Verified members
```

---

## 🏗️ Project Structure

```
extract-linkedin-premium-users-from-linkedin-groups/
└── agentic/
    └── mastra/
        ├── agent.ts                      # CLI entry point
        ├── package.json                  # Dependencies and scripts
        ├── tsconfig.json                 # TypeScript configuration
        ├── README.md                     # This file
        ├── .env                          # Environment variables (create this)
        ├── index.ts                      # Mastra configuration
        ├── agents/
        │   └── linkedin-group-members-fetcher-agent.ts  # Agent definition
        └── tools/
            ├── linkedin/
            │   ├── index.ts              # Tool exports
            │   ├── types.ts              # TypeScript types
            │   ├── complete-group-members-workflow.ts    # Main workflow tool
            │   ├── fetch-all-linkedin-group-members.ts   # Fetch all tool
            │   ├── fetch-linkedIn-group-members-tool.ts   # Single batch tool
            │   ├── fetch-group-members-by-url.ts         # URL resolver tool
            │   └── filter-premium-members-tool.ts        # Filter tool
            └── googlesheet/
                ├── index.ts
                └── google-sheet.ts       # Google Sheets integration
```

---

## 🔧 Environment Variables

### Required

- `CONNECTSAFELY_API_TOKEN` - Your ConnectSafely.ai API key

### Optional (for Google Sheets)

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REFRESH_TOKEN` - Google OAuth refresh token

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Failed to fetch LinkedIn group members" or "Unauthorized"

- **Solution**: 
  - Verify your `CONNECTSAFELY_API_TOKEN` is set correctly in `.env`
  - Check that your ConnectSafely.ai API key is valid and active
  - Ensure you're a member of the target LinkedIn group (ConnectSafely.ai can only access groups you've joined)

**Issue**: Empty results returned

- **Solution**: 
  - Verify you're a member of the target LinkedIn group
  - Check that the groupId is correct
  - Some groups may have privacy settings that limit member visibility

**Issue**: "Failed to refresh Google access token"

- **Solution**: 
  - Verify your Google OAuth credentials are set in `.env`
  - Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` are all present
  - Check that your refresh token hasn't expired

**Issue**: Module not found errors

- **Solution**: 
  - Ensure all imports use `.js` extensions (even for `.ts` files)
  - Run `bun install` to ensure all dependencies are installed
  - Verify you're using Bun runtime (not Node.js)

**Issue**: Agent doesn't understand my query

- **Solution**: 
  - Be specific about what you want (e.g., "fetch 10 premium members from group 9357376")
  - Include the group ID or URL
  - Mention if you want to save to Google Sheets

---

## 📚 Documentation & Support

### Official Documentation

- **ConnectSafely.ai Docs**: https://connectsafely.ai/docs
- **ConnectSafely.ai Dashboard**: https://connectsafely.ai
- **Mastra Documentation**: https://mastra.ai/docs

### ConnectSafely.ai Support

- **Email**: support@connectsafely.ai
- **Documentation**: https://connectsafely.ai/docs
- **Dashboard**: https://connectsafely.ai (for API key management)

### Connect With ConnectSafely.ai

Stay updated with the latest automation tips, LinkedIn strategies, and platform updates:

- **LinkedIn**: [linkedin.com/company/connectsafelyai](https://linkedin.com/company/connectsafelyai)
- **YouTube**: [youtube.com/@ConnectSafelyAI-v2x](https://youtube.com/@ConnectSafelyAI-v2x)
- **Instagram**: [instagram.com/connectsafely.ai](https://instagram.com/connectsafely.ai)
- **Facebook**: [facebook.com/connectsafelyai](https://facebook.com/connectsafelyai)
- **X (Twitter)**: [x.com/AiConnectsafely](https://x.com/AiConnectsafely)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

This project is built on:
- **[ConnectSafely.ai](https://connectsafely.ai)** - LinkedIn automation API platform
- **[Mastra](https://mastra.ai)** - Agentic framework for building AI agents
- **[Google Gemini](https://deepmind.google/technologies/gemini/)** - AI model powering the agent
