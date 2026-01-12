# LinkedIn Job Search → Hiring Manager Outreach Agent

An intelligent AI agent built with [Mastra](https://mastra.ai) that automates the job search process and helps job seekers connect with hiring managers using the [ConnectSafely.ai](https://connectsafely.ai) API. This agent enables job seekers to find relevant positions, identify hiring managers, and send personalized connection requests automatically.

## 🎯 Purpose

This project provides an **AI-powered agent** that can:

- **Search for Jobs**: Find LinkedIn job postings by keywords and location
- **Get Company Details**: Retrieve comprehensive information about companies with open positions
- **Find Hiring Managers**: Automatically identify hiring managers, recruiters, and decision-makers at target companies
- **Fetch Profile Details**: Get detailed information about hiring managers to personalize outreach
- **Check Connection Status**: Verify if you're already connected before sending requests
- **Send Connection Requests**: Automatically send personalized connection requests to hiring managers

### Use Cases

- **Job Seekers**: Automate the process of finding jobs and reaching out to hiring managers
- **Career Changers**: Quickly identify opportunities in new industries and connect with relevant decision-makers
- **Passive Job Seekers**: Stay informed about opportunities without manual searching
- **Recruiters**: Find and connect with hiring managers at target companies
- **Sales Professionals**: Identify decision-makers at companies with open positions (potential expansion indicators)

---

## 🔌 ConnectSafely.ai Integration

This agent is built entirely on top of the **ConnectSafely.ai API**, which provides secure and reliable access to LinkedIn data. ConnectSafely.ai handles all the complexity of LinkedIn API interactions, authentication, and data normalization.

### Why ConnectSafely.ai?

ConnectSafely.ai is a specialized platform that:
- **Simplifies LinkedIn Automation**: No need to manage LinkedIn API credentials directly
- **Provides Reliable Access**: Handles rate limiting, authentication, and API changes automatically
- **Ensures Data Quality**: Returns normalized, structured data with comprehensive profile information
- **Scales Efficiently**: Built to handle large-scale job searches and profile lookups

### ConnectSafely.ai API Overview

#### API Endpoints Used

The agent uses multiple ConnectSafely.ai endpoints:

1. **Geographic Location Search**
   ```
   POST https://api.connectsafely.ai/linkedin/search/geo
   ```

2. **Job Search**
   ```
   POST https://api.connectsafely.ai/linkedin/search/jobs
   ```

3. **Company Details**
   ```
   POST https://api.connectsafely.ai/linkedin/search/companies/details
   ```

4. **People Search (Hiring Managers)**
   ```
   POST https://api.connectsafely.ai/linkedin/search/people
   ```

5. **Profile Details**
   ```
   POST https://api.connectsafely.ai/linkedin/profile
   ```

6. **Connection Status**
   ```
   GET https://api.connectsafely.ai/linkedin/relationship/{profileId}
   ```

7. **Send Connection Request**
   ```
   POST https://api.connectsafely.ai/linkedin/connect
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

---

## 🤖 How the Agent Works

The **Job Search → Hiring Manager Outreach Agent** is an AI agent powered by Google's Gemini 2.5 Flash model. It uses a set of specialized tools to interact with the ConnectSafely.ai API.

### Agent Architecture

```
User Query
    ↓
AI Agent (Gemini 2.5 Flash)
    ↓
Tool Selection & Execution
    ↓
ConnectSafely.ai API → LinkedIn
    ↓
Data Processing & Analysis
    ↓
Response to User
```

### Agent Capabilities

The agent can:
- **Understand natural language queries** (e.g., "Find software engineering jobs in Australia and connect with hiring managers")
- **Automatically select the right tools** for the task
- **Search for geographic locations** to get location IDs
- **Find relevant job postings** based on keywords and location
- **Identify appropriate hiring managers** based on job titles
- **Personalize connection messages** with hiring manager names and job details
- **Check connection status** before sending requests
- **Remember context** across multiple interactions

### Available Tools

The agent has access to 8 specialized tools:

1. **`searchGeoLocationTool`** - Search for geographic locations to get location IDs
2. **`searchJobsTool`** - Search for LinkedIn jobs by keywords and location
3. **`getCompanyDetailsTool`** - Get detailed information about a company
4. **`searchHiringManagersTool`** - Search for hiring managers/recruiters at a specific company
5. **`fetchProfileDetailsTool`** - Fetch detailed profile information for a LinkedIn user
6. **`checkConnectionStatusTool`** - Check connection status with a LinkedIn profile
7. **`sendConnectionRequestTool`** - Send a LinkedIn connection request with custom message
8. **`completeJobSearchWorkflowTool`** - High-level workflow tool (returns data only)

---

## 🛠️ Setup Instructions

### Prerequisites

- **Bun** >= 1.0.0 - [Install Bun](https://bun.sh/docs/installation)
- **ConnectSafely.ai API Key** - Get yours at [connectsafely.ai](https://connectsafely.ai)

### Installation

1. **Navigate to the project directory**:

   ```bash
   cd job-seekers-reach-out-to-hiring-managers/agentic/mastra
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
   ```

> **Note**: This project uses **Bun**, which can run TypeScript directly without building. No compilation step is required!

---

## 🚀 Usage

You can run the agent in two ways: **Mastra UI** (visual interface) or **CLI** (command-line interface). Both use the same agent and provide identical functionality.

### Option 1: Mastra UI (Recommended for Development)

The Mastra UI provides a visual web interface to interact with your agent, view tool executions, and monitor observability metrics.

**Start the Mastra UI:**

```bash
bun run dev
# or
mastra dev --dir .
```

The `--dir .` flag tells Mastra to look for `index.ts` in the current directory instead of the default `src/mastra/` location.

**What happens:**
1. Mastra starts a development server
2. Opens a web UI in your browser (usually at `http://localhost:3000` or similar)
3. You can interact with your `jobSearchOutreachAgent` through the visual interface
4. See real-time tool execution, conversation history, and observability metrics

**Benefits of Mastra UI:**
- ✅ Visual interface for easier interaction
- ✅ Real-time tool execution visibility
- ✅ Conversation history timeline
- ✅ Observability charts and metrics
- ✅ Better debugging experience

**Using the UI:**
- Select the `jobSearchOutreachAgent` from the agents list
- Type your query in the chat interface
- Watch tools execute in real-time
- View detailed results and summaries

### Option 2: CLI (Command-Line Interface)

The CLI provides a text-based interface for running the agent directly from your terminal.

**Interactive Mode (REPL):**

```bash
bun agent.ts
# or
npm start
# or
npm run cli
```

This starts an interactive session where you can type queries and get responses.

**Non-Interactive Mode (One Command):**

```bash
bun agent.ts "Find software engineering jobs in Australia and connect with hiring managers"
# or
npm start -- "Find software engineering jobs in Australia and connect with hiring managers"
```

This executes a single query and exits.

**Benefits of CLI:**
- ✅ Fast and lightweight
- ✅ Easy to integrate into scripts
- ✅ Works well for automation
- ✅ Simple text-based output

### Choosing Between UI and CLI

| Feature | Mastra UI | CLI |
|---------|-----------|-----|
| **Best For** | Development, debugging, exploration | Production, automation, scripts |
| **Interface** | Visual web interface | Text-based terminal |
| **Tool Visibility** | Real-time visual tool calls | Text summary |
| **Observability** | Charts and metrics | Basic summary |
| **Setup** | `npm run dev` | `bun agent.ts` |
| **Speed** | Slightly slower (web server) | Fast (direct execution) |

**Recommendation:**
- Use **Mastra UI** when developing, testing, or exploring the agent's capabilities
- Use **CLI** for production deployments, automation, or when you need script integration

### Optional: Building for Production

If you need to build for production (e.g., for deployment without Bun), you can still compile:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Example Queries

The agent understands natural language queries:

```
> Find software engineering jobs in Australia
> Search for sales manager positions in New York and find hiring managers
> Get jobs for marketing director in San Francisco and connect with recruiters
> Find 5 software engineer jobs in Australia and send connection requests to hiring managers
> Search for data scientist positions in London
```

---

## 📋 Available Tools

### 1. Search Geographic Location (`search-geo-location`)

**Purpose**: Search for geographic locations to get location IDs for job searches.

**Input Parameters**:
- `keywords` (string, required): Location keywords (e.g., 'Australia', 'New York')

**Output**:
```typescript
{
  locations: Array<{
    id: string;
    name: string;
    country?: string;
  }>;
}
```

**Use Cases**:
- Converting location names to location IDs
- Finding location IDs for job searches
- Supporting location-based queries

---

### 2. Search Jobs (`search-jobs`)

**Purpose**: Search for LinkedIn jobs by keywords and location.

**Input Parameters**:
- `keywords` (string, required): Job search keywords (e.g., 'Software Engineer')
- `count` (number, optional): Number of jobs to return (max 25, default: 5)
- `start` (number, optional): Pagination offset (default: 0)
- `locationId` (string, optional): Geographic location ID from search-geo-location
- `datePosted` (enum, optional): Date filter - 'past-24-hours', 'past-week', 'past-month' (default: 'past-week')

**Output**:
```typescript
{
  jobs: Array<{
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
  }>;
  total?: number;
}
```

**Use Cases**:
- Finding relevant job postings
- Searching by keywords and location
- Filtering by date posted

---

### 3. Get Company Details (`get-company-details`)

**Purpose**: Get detailed information about a company by company ID or universal name.

**Input Parameters**:
- `companyId` (string, required): Company ID or universal name

**Output**:
```typescript
{
  company: {
    id: string;
    name: string;
    universalName?: string;
    description?: string;
    website?: string;
    industry?: string;
  };
}
```

**Use Cases**:
- Getting company information
- Researching target companies
- Understanding company details before outreach

---

### 4. Search Hiring Managers (`search-hiring-managers`)

**Purpose**: Search for hiring managers or recruiters at a specific company.

**Input Parameters**:
- `companyId` (string, required): Numeric company ID (not universal name)
- `jobTitle` (string, optional): Job title to help determine appropriate manager titles
- `managerTitle` (string, optional): Custom manager title keywords (e.g., 'Engineering Manager OR VP Engineering')
- `count` (number, optional): Number of people to return (max 25, default: 5)
- `connectionDegree` (array, optional): Connection degree filter - ['S', 'O'] for 2nd and 3rd+ degree (default: ['S', 'O'])

**Output**:
```typescript
{
  people: Array<{
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
  }>;
}
```

**Smart Title Detection**:
The tool automatically determines appropriate manager titles based on job title:
- Engineering jobs → "Engineering Manager OR VP Engineering OR CTO"
- Sales jobs → "Sales Director OR VP Sales"
- Marketing jobs → "Marketing Director OR CMO"
- Default → "Hiring Manager OR Recruiter"

**Use Cases**:
- Finding decision-makers at target companies
- Identifying hiring managers for specific roles
- Connecting with recruiters

---

### 5. Fetch Profile Details (`fetch-profile-details`)

**Purpose**: Fetch detailed profile information for a LinkedIn user by profile ID (vanity name).

**Input Parameters**:
- `profileId` (string, required): Profile ID (vanity name from publicIdentifier or profileUrl)

**Output**:
```typescript
{
  profile: {
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
  };
}
```

**Use Cases**:
- Getting detailed profile information
- Personalizing connection messages
- Understanding hiring manager background

---

### 6. Check Connection Status (`check-connection-status`)

**Purpose**: Check the connection status with a LinkedIn profile (connected, invitation sent, etc.).

**Input Parameters**:
- `profileId` (string, required): Profile ID (vanity name)

**Output**:
```typescript
{
  connected: boolean;
  invitationSent: boolean;
  invitationReceived: boolean;
}
```

**Use Cases**:
- Verifying connection status before sending requests
- Avoiding duplicate connection requests
- Checking if already connected

---

### 7. Send Connection Request (`send-connection-request`)

**Purpose**: Send a LinkedIn connection request with a custom message.

**Input Parameters**:
- `profileId` (string, required): Profile ID (vanity name)
- `customMessage` (string, required): Custom message to include with the connection request

**Output**:
```typescript
{
  success: boolean;
  message?: string;
}
```

**Important**: Always check connection status before sending requests!

**Use Cases**:
- Sending personalized connection requests
- Reaching out to hiring managers
- Building professional network

---

### 8. Complete Job Search Workflow (`complete-job-search-workflow`)

**Purpose**: High-level workflow tool that returns data only (does not send connection requests).

**Input Parameters**:
- `jobKeywords` (string, required): Job search keywords (e.g., 'Software Engineer')
- `locationKeywords` (string, optional): Location keywords (e.g., 'Australia')
- `locationId` (string, optional): Pre-known location ID (skips geo search if provided)
- `jobCount` (number, optional): Number of jobs to process (max 5, default: 3)
- `managerCount` (number, optional): Number of hiring managers to find per job (max 5, default: 3)

**Output**:
```typescript
{
  jobs: Array<any>;
  hiringManagers: Array<{
    job: any;
    managers: Array<any>;
  }>;
}
```

**Use Cases**:
- Quick overview of jobs and hiring managers
- Research without sending requests
- Data collection for analysis

---

## 🔄 Typical Workflows

### Workflow 1: Find Jobs and Hiring Managers

```
User: "Find software engineering jobs in Australia"
  ↓
Agent uses: searchGeoLocationTool (if location name provided)
  ↓
Agent uses: searchJobsTool
  ↓
Agent uses: getCompanyDetailsTool (optional)
  ↓
Agent uses: searchHiringManagersTool (for each job)
  ↓
Returns: Jobs and hiring managers found
```

### Workflow 2: Connect with Hiring Managers

```
User: "Find software engineering jobs in Australia and connect with hiring managers"
  ↓
Agent uses: searchGeoLocationTool
  ↓
Agent uses: searchJobsTool
  ↓
Agent uses: searchHiringManagersTool
  ↓
Agent uses: fetchProfileDetailsTool (for each manager)
  ↓
Agent uses: checkConnectionStatusTool
  ↓
Agent uses: sendConnectionRequestTool (if not connected)
  ↓
Returns: Connection requests sent successfully
```

### Workflow 3: Research Only (No Connection Requests)

```
User: "Show me marketing jobs in San Francisco and their hiring managers"
  ↓
Agent uses: searchGeoLocationTool
  ↓
Agent uses: searchJobsTool
  ↓
Agent uses: searchHiringManagersTool
  ↓
Agent uses: fetchProfileDetailsTool
  ↓
Returns: Jobs and hiring manager details (no connection requests)
```

---

## 🏗️ Project Structure

```
job-seekers-reach-out-to-hiring-managers/
└── agentic/
    └── mastra/
        ├── agent.ts                      # CLI entry point
        ├── package.json                  # Dependencies and scripts
        ├── tsconfig.json                 # TypeScript configuration
        ├── README.md                     # This file
        ├── .env                          # Environment variables (create this)
        ├── dist/                         # Compiled JavaScript (after build)
        ├── index.ts                      # Mastra configuration
        ├── agents/
        │   └── job-search-outreach-agent.ts  # Agent definition
        └── tools/
            ├── index.ts                  # Tool exports
            ├── types.ts                  # TypeScript types
            ├── search-geo-location.ts    # Geographic location search
            ├── search-jobs.ts             # Job search tool
            ├── get-company-details.ts     # Company details tool
            ├── search-hiring-managers.ts  # Hiring manager search
            ├── fetch-profile-details.ts   # Profile details tool
            ├── check-connection-status.ts # Connection status check
            ├── send-connection-request.ts # Connection request tool
            └── complete-job-search-workflow.ts  # Complete workflow tool
```

---

## 🔧 Environment Variables

### Required

- `CONNECTSAFELY_API_TOKEN` - Your ConnectSafely.ai API key

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Failed to search geographic locations" or "Unauthorized"

- **Solution**: 
  - Verify your `CONNECTSAFELY_API_TOKEN` is set correctly in `.env`
  - Check that your ConnectSafely.ai API key is valid and active
  - Ensure the API key has the necessary permissions

**Issue**: No jobs found

- **Solution**: 
  - Try different keywords or broader search terms
  - Verify the location ID is correct
  - Check if there are jobs matching your criteria in that location
  - Try adjusting the `datePosted` filter

**Issue**: No hiring managers found

- **Solution**: 
  - Verify the company ID is correct (must be numeric, not universal name)
  - Try different manager title keywords
  - Some companies may not have publicly visible hiring managers
  - Check connection degree filters (try including 'O' for 3rd+ degree)

**Issue**: "Failed to send connection request"

- **Solution**: 
  - Always check connection status first
  - Ensure you're not already connected
  - Verify the profile ID (vanity name) is correct
  - Check if you've reached LinkedIn connection request limits

**Issue**: "Missing required file" when running `mastra dev`

- **Solution**: 
  - Use the `--dir .` flag: `mastra dev --dir .`
  - This tells Mastra to look for `index.ts` in the current directory
  - Alternatively, update your `package.json` script: `"dev": "mastra dev --dir ."`

**Issue**: Build errors with module not found

- **Solution**: 
  - Ensure all imports use `.js` extensions (even for `.ts` files)
  - Verify all dependencies are installed: `bun install`
  - With Bun, you don't need to build - just run `bun agent.ts` directly
  - If building for production, run `npm run build` and check that `dist/` directory exists

**Issue**: Agent doesn't understand my query

- **Solution**: 
  - Be specific about what you want (e.g., "Find software engineering jobs in Australia")
  - Include location information
  - Mention if you want to connect with hiring managers
  - Use clear job title keywords

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

