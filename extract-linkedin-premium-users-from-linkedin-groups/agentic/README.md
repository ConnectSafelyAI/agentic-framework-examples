# Extract Premium & Verified LinkedIn Group Members

An agentic framework example built with [Mastra](https://mastra.ai) that automates the extraction of Premium and Verified LinkedIn group members using the [ConnectSafely.ai](https://connectsafely.ai) API. This project enables sales professionals, community managers, recruiters, and growth marketers to identify high-quality leads from LinkedIn groups without manual effort.

## Purpose

This project provides an intelligent agent that can:

- **Extract LinkedIn Group Members**: Fetch members from any LinkedIn group you're a member of
- **Filter Premium & Verified Profiles**: Automatically identify decision-makers, founders, and verified professionals
- **Handle Pagination**: Process groups of any size (from 500 to 50,000+ members)
- **Export to Google Sheets**: Seamlessly export filtered member data to Google Spreadsheets
- **Complete Workflows**: Execute end-to-end automation from extraction to export in a single operation

### Use Cases

- **Sales Prospecting**: Build targeted prospect lists from industry-specific groups with verified decision-makers
- **Competitor Research**: Analyze who's active in competitor communities and their professional backgrounds
- **Influencer Identification**: Find Premium creators and verified professionals for partnership opportunities
- **Recruiting**: Source passive candidates who are active in professional development groups
- **Event Marketing**: Identify engaged professionals in niche communities for webinar and conference promotion
- **Content Strategy**: Research headlines and titles to understand what resonates in your industry

## ConnectSafely.ai Configuration

This project uses the [ConnectSafely.ai API](https://connectsafely.ai/docs) to interact with LinkedIn groups. The configuration details are as follows:

### API Endpoint

The project makes requests to the ConnectSafely.ai LinkedIn Groups API:

```
POST https://api.connectsafely.ai/linkedin/groups/members
```

### Authentication

ConnectSafely.ai uses **Bearer Token Authentication**. All API requests require an authorization header with your API key:

```typescript
headers: {
  Authorization: `Bearer ${apiToken}`,
  "Content-Type": "application/json",
}
```

### Obtaining Your API Key

1. Log into the [ConnectSafely.ai Dashboard](https://connectsafely.ai)
2. Navigate to **Settings** → **API Keys**
3. Generate a new API key
4. Copy the API key (you'll need it when running the agent)

### API Request Format

The API accepts the following request body:

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

### API Response Format

The API returns member data with the following structure:

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
      isPremium: boolean;
      isVerified: boolean;
      badges: string[];
      relationshipStatus: string;
      creator: boolean;
    }
  ],
  hasMore: boolean;
}
```

### Features Used

The project leverages the following ConnectSafely.ai API capabilities:

1. **Group Member Extraction**: Fetches member profiles from LinkedIn groups
2. **Pagination Support**: Handles large groups with automatic pagination
3. **Premium/Verified Status**: Identifies Premium subscribers and verified profiles
4. **Profile Metadata**: Retrieves comprehensive profile information including headlines, follower counts, and relationship status

### Rate Limits & Best Practices

- Maximum `count` per request: **100 members**
- The API handles pagination automatically via the `hasMore` flag
- Ensure you're a member of the target LinkedIn group (API can only access groups you've joined)
- For large groups, the agent automatically handles pagination to fetch all members

## Setup Instructions

### Prerequisites

- Node.js >= 22.13.0
- ConnectSafely.ai API key
- Google OAuth2 access token (for Google Sheets export)

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   cd mastra/extract-linkedin-premium-users-from-linkedin-groups/agents
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure your API credentials**:
   - You'll need to provide your ConnectSafely.ai API token when running the agent
   - For Google Sheets export, you'll need a Google OAuth2 access token

### Running the Agent

1. **Start the Mastra development server**:

   ```bash
   npm run dev
   ```

2. **Interact with the agent**:
   - The agent will prompt you for your ConnectSafely.ai API token if not provided
   - Provide the LinkedIn group ID or URL you want to extract members from
   - The agent will automatically filter for Premium and Verified members
   - Optionally export results to Google Sheets

## Available Tools

The agent provides 9 powerful tools for LinkedIn group member extraction and Google Sheets management. Each tool is designed for specific use cases and can be used independently or combined for complex workflows.

### 1. Fetch LinkedIn Group Members (`fetch-linkedin-group-members`)

**Purpose**: Fetch members from a LinkedIn group with manual pagination support. Use this tool when you need fine-grained control over pagination or want to fetch a specific subset of members.

**Input Parameters**:
- `apiToken` (string, required): ConnectSafely.ai API bearer token
- `groupId` (string, required): LinkedIn group ID (e.g., "9357376")
- `count` (number, optional): Number of members per request (1-100, default: 50)
- `start` (number, optional): Pagination offset - starting position (default: 0)

**Output**:
```typescript
{
  members: Array<{
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
  }>;
  hasMore: boolean;
  fetchedCount: number;
}
```

**Use Cases**:
- Fetching a specific page of results
- Testing API connectivity
- Sampling members from a large group

**Example**: Fetch first 50 members starting from position 0

---

### 2. Fetch All LinkedIn Group Members (`fetch-all-linkedin-group-members`)

**Purpose**: Automatically fetch ALL members from a LinkedIn group by handling pagination internally. This tool continues fetching until all members are retrieved or a maximum limit is reached.

**Input Parameters**:
- `apiToken` (string, required): ConnectSafely.ai API bearer token
- `groupId` (string, required): LinkedIn group ID
- `batchSize` (number, optional): Members per API request (1-100, default: 50)
- `maxMembers` (number, optional): Maximum members to fetch (optional limit to prevent excessive API calls)

**Output**:
```typescript
{
  allMembers: Array<GroupMember>;  // Same structure as above
  totalFetched: number;
  requestsMade: number;
}
```

**Use Cases**:
- Extracting complete member lists from groups
- Bulk data collection for analysis
- When you need all members without manual pagination

**Features**:
- Automatic pagination handling
- Built-in rate limiting (500ms delay between requests)
- Optional maximum member limit
- Progress tracking via request count

**Example**: Fetch all members from group "9357376" with a maximum of 1000 members

---

### 3. Filter Premium/Verified Members (`filter-premium-verified-members`)

**Purpose**: Filter an array of LinkedIn group members to only include Premium or Verified profiles. This tool checks multiple indicators including `isPremium`, `isVerified` flags and badge arrays.

**Input Parameters**:
- `members` (array, required): Array of group members to filter (from fetch tools)

**Output**:
```typescript
{
  filteredMembers: Array<{
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
    badges: string;  // Comma-separated string
    relationshipStatus: string;
    creator: boolean;
    fetchedAt: string;  // ISO timestamp
  }>;
  totalFiltered: number;
  originalCount: number;
}
```

**Filtering Logic**:
The tool includes members if ANY of the following are true:
- `isPremium === true`
- `isVerified === true`
- Badges array includes "premium"
- Badges array includes "verified"

**Use Cases**:
- Identifying high-value prospects
- Finding decision-makers and influencers
- Building premium lead lists

**Example**: Filter 500 members to find only Premium/Verified profiles

---

### 4. Export Members to Google Sheets (`export-members-to-google-sheets`)

**Purpose**: Export LinkedIn group members to an existing Google Sheet. Automatically handles duplicate detection using Profile ID and only appends new members.

**Input Parameters**:
- `members` (array, required): Array of processed members to export
- `spreadsheetId` (string, required): Google Sheets spreadsheet ID (from URL)
- `sheetName` (string, required): Sheet name/tab within the spreadsheet
- `accessToken` (string, required): Google OAuth2 access token

**Output**:
```typescript
{
  success: boolean;
  rowsAdded: number;
  spreadsheetUrl: string;
}
```

**Features**:
- Automatic duplicate detection (by Profile ID)
- Only appends new members (skips existing)
- Returns spreadsheet URL for easy access

**Use Cases**:
- Adding new members to existing spreadsheets
- Updating member databases
- Incremental data collection

**Example**: Export 50 filtered members to an existing Google Sheet

---

### 5. Complete Group Members Workflow (`complete-group-members-workflow`)

**Purpose**: End-to-end automation that fetches all LinkedIn group members, filters for Premium/Verified profiles, and exports to Google Sheets in a single operation. This is the most comprehensive tool for complete automation.

**Input Parameters**:
- `apiToken` (string, required): ConnectSafely.ai API bearer token
- `groupId` (string, required): LinkedIn group ID
- `batchSize` (number, optional): Members per API request (1-100, default: 50)
- `spreadsheetId` (string, required): Google Sheets spreadsheet ID
- `sheetName` (string, required): Sheet name/tab
- `googleAccessToken` (string, required): Google OAuth2 access token
- `filterPremiumOnly` (boolean, optional): Only include Premium/Verified members (default: true)
- `maxMembers` (number, optional): Maximum members to fetch

**Output**:
```typescript
{
  success: boolean;
  totalFetched: number;
  totalFiltered: number;
  rowsExported: number;
  requestsMade: number;
  spreadsheetUrl: string;
  summary: string;
}
```

**Workflow Steps**:
1. Fetches all members with automatic pagination
2. Filters for Premium/Verified members (if enabled)
3. Processes member data for export
4. Checks existing sheet for duplicates
5. Appends only new members to Google Sheets

**Use Cases**:
- One-click complete automation
- Scheduled member extraction
- Bulk data collection and export

**Example**: Extract all Premium/Verified members from group "9357376" and export to Google Sheets

---

### 6. Get Group Members by URL (`get-group-members-by-url`)

**Purpose**: Fetch LinkedIn group members using the group URL instead of requiring the group ID. Automatically extracts the group ID from the URL.

**Input Parameters**:
- `apiToken` (string, required): ConnectSafely.ai API bearer token
- `groupUrl` (string, required): LinkedIn group URL (e.g., "https://www.linkedin.com/groups/9357376/")
- `count` (number, optional): Number of members per request (1-100, default: 50)
- `start` (number, optional): Pagination offset (default: 0)

**Output**:
```typescript
{
  members: Array<{
    profileId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    headline: string;
  }>;
  hasMore: boolean;
  groupId: string;  // Extracted group ID
}
```

**Features**:
- Automatic group ID extraction from URL
- Supports various LinkedIn URL formats
- Returns extracted group ID for reference

**Use Cases**:
- When you only have the group URL
- Quick extraction without manual ID lookup
- User-friendly interface for non-technical users

**Example**: Fetch members using "https://www.linkedin.com/groups/9357376/"

---

### 7. Create Google Sheet (`create-google-sheet`)

**Purpose**: Create a new Google Spreadsheet with custom sheet name and optional header row. Perfect for setting up sheets before adding LinkedIn member data.

**Input Parameters**:
- `accessToken` (string, required): Google OAuth2 access token
- `spreadsheetTitle` (string, required): Title of the new spreadsheet
- `sheetName` (string, optional): Name of the first sheet/tab (default: "Sheet1")
- `includeHeaders` (boolean, optional): Add header row for LinkedIn member data (default: true)
- `customHeaders` (array, optional): Custom header row (if not using default LinkedIn headers)

**Output**:
```typescript
{
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetId: number;
  sheetName: string;
  headersAdded: boolean;
}
```

**Default Headers** (if `includeHeaders: true`):
- Profile ID
- First Name
- Last Name
- Full Name
- Headline
- Public Identifier
- Profile URL
- Follower Count
- Is Premium
- Is Verified
- Badges
- Relationship Status

**Features**:
- Automatic header formatting (bold, gray background)
- Frozen header row for easy scrolling
- Customizable sheet configuration

**Use Cases**:
- Setting up new spreadsheets for member data
- Creating organized data structures
- Preparing sheets for bulk imports

**Example**: Create a new spreadsheet titled "LinkedIn Premium Members - Q1 2024"

---

### 8. Add Data to Google Sheet (`add-data-to-google-sheet`)

**Purpose**: Generic tool for adding rows of data to an existing Google Sheet. Supports append, update, and append-or-update modes with duplicate detection.

**Input Parameters**:
- `accessToken` (string, required): Google OAuth2 access token
- `spreadsheetId` (string, required): Google Sheets spreadsheet ID
- `sheetName` (string, required): Sheet name/tab
- `data` (array, required): 2D array of data to add `[[row1], [row2], ...]`
- `mode` (enum, optional): How to add data:
  - `"append"`: Always add new rows
  - `"update"`: Only update existing rows
  - `"appendOrUpdate"`: Add if new, update if exists (default: "append")
- `uniqueColumnIndex` (number, optional): Column index (0-based) for duplicate detection (default: 0)
- `startRow` (number, optional): Start from specific row (for append mode)

**Output**:
```typescript
{
  success: boolean;
  rowsProcessed: number;
  rowsAdded: number;
  rowsUpdated: number;
  spreadsheetUrl: string;
  range: string;
}
```

**Modes Explained**:
- **Append**: Always adds new rows, no duplicate checking
- **Update**: Only updates existing rows based on unique column, ignores new data
- **Append or Update**: Smart mode - adds new rows, updates existing ones

**Use Cases**:
- Generic data export to Google Sheets
- Updating existing records
- Bulk data operations
- Flexible data management

**Example**: Add 100 rows of data with append-or-update mode using column 0 as unique identifier

---

### 9. Create Sheet and Add Members (`create-sheet-and-add-members`)

**Purpose**: Complete workflow tool that creates a new Google Sheet with proper headers and adds LinkedIn group member data in one operation. This is the recommended tool for creating new spreadsheets with member data.

**Input Parameters**:
- `accessToken` (string, required): Google OAuth2 access token
- `spreadsheetTitle` (string, required): Title for the new spreadsheet
- `sheetName` (string, optional): Name of the sheet/tab (default: "LinkedIn Members")
- `members` (array, required): Array of LinkedIn members to add

**Output**:
```typescript
{
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  membersAdded: number;
  summary: string;
}
```

**Workflow Steps**:
1. Creates new Google Spreadsheet
2. Sets up sheet with proper grid properties
3. Adds formatted header row (bold, blue background, white text)
4. Appends all member data
5. Returns spreadsheet URL

**Features**:
- One-step sheet creation and data population
- Professional header formatting
- Frozen header row
- Complete member data structure

**Use Cases**:
- Creating new spreadsheets from scratch
- Quick export of filtered members
- One-click complete workflow
- Recommended for most use cases

**Example**: Create "Premium Members - Tech Group" spreadsheet and add 50 filtered members

---

## Tool Usage Recommendations

### For Quick Extraction
1. Use `fetch-all-linkedin-group-members` to get all members
2. Use `filter-premium-verified-members` to filter
3. Use `create-sheet-and-add-members` to export

### For Incremental Updates
1. Use `fetch-linkedin-group-members` for specific pages
2. Use `export-members-to-google-sheets` to add to existing sheet

### For Complete Automation
1. Use `complete-group-members-workflow` for end-to-end automation

### For User-Friendly Interface
1. Use `get-group-members-by-url` when users only have URLs
2. Combine with `create-sheet-and-add-members` for seamless experience

## Project Structure

```
extract-linkedin-premium-users-from-linkedin-groups/
├── agents/
│   ├── src/
│   │   └── mastra/
│   │       ├── index.ts                    # Mastra configuration
│   │       ├── agents/
│   │       │   └── linkedin-group-extractor-agent.ts  # Main agent definition
│   │       └── tools/
│   │           └── linkedin-group-extractor-tools.ts   # API integration tools
│   └── package.json
└── README.md
```

## Related Resources

This project is inspired by and compatible with the n8n workflow template:

- **[n8n Workflow Template](https://n8n.io/workflows/11450-extract-premium-and-verified-linkedin-group-members-to-google-sheets-with-connectsafelyai/)**: A no-code automation workflow that performs similar LinkedIn group member extraction using ConnectSafely.ai

### Key Differences

- **n8n Workflow**: Visual workflow builder, no-code solution
- **This Project**: Agentic framework with AI-powered agent that can make decisions and handle complex workflows

Both solutions use the same ConnectSafely.ai API and can achieve similar results, but this Mastra-based approach provides more flexibility and AI-driven automation capabilities.

## Documentation & Support

### Official Documentation

- **ConnectSafely.ai Docs**: https://connectsafely.ai/docs
- **Mastra Documentation**: https://mastra.ai/docs
- **API Reference**: Available in ConnectSafely.ai dashboard

### Support Channels

- **Email Support**: support@connectsafely.ai
- **Documentation**: https://connectsafely.ai/docs

## Troubleshooting

### Common Issues

**Issue**: Empty results returned

- **Solution**: Verify you're a member of the target LinkedIn group; API can only access groups you've joined

**Issue**: "401 Unauthorized" errors

- **Solution**: Check that your ConnectSafely.ai API key is valid and correctly provided

**Issue**: Pagination seems infinite

- **Solution**: This is expected behavior until `hasMore` returns false; large groups may take several minutes to fully process

**Issue**: Missing data in certain fields

- **Solution**: Not all profiles have complete data; the agent handles null values gracefully

## License

MIT License - See LICENSE file for details

## Connect With ConnectSafely.ai

Stay updated with the latest automation tips, LinkedIn strategies, and platform updates:

- **LinkedIn**: [linkedin.com/company/connectsafelyai](https://linkedin.com/company/connectsafelyai)
- **YouTube**: [youtube.com/@ConnectSafelyAI-v2x](https://youtube.com/@ConnectSafelyAI-v2x)
- **Instagram**: [instagram.com/connectsafely.ai](https://instagram.com/connectsafely.ai)
- **Facebook**: [facebook.com/connectsafelyai](https://facebook.com/connectsafelyai)
- **X (Twitter)**: [x.com/AiConnectsafely](https://x.com/AiConnectsafely)
