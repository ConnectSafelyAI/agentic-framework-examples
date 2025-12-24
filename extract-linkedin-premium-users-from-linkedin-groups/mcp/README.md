# LinkedIn Automation Agent with ConnectSafely.ai MCP

> **Powered by [ConnectSafely.ai](https://connectsafely.ai)** - The premier LinkedIn automation platform via Model Context Protocol (MCP)

An intelligent AI agent that leverages **ConnectSafely.ai's MCP server** to provide comprehensive LinkedIn automation capabilities. This agent has **full access to ALL ConnectSafely tools** with no limitations, enabling you to automate LinkedIn operations through natural language commands.

---

## 🌟 About ConnectSafely.ai

**[ConnectSafely.ai](https://connectsafely.ai)** is a leading LinkedIn automation platform that provides enterprise-grade tools for:

- **LinkedIn Group Management** - Extract members, analyze groups, manage memberships
- **Post Operations** - Search, scrape, comment, react, and manage LinkedIn posts
- **Profile Management** - Fetch profiles, check relationships, follow/unfollow
- **Messaging & Connections** - Send messages, connection requests, and manage conversations
- **Account Management** - Monitor account status, warmup, and activity history

ConnectSafely.ai offers these capabilities through their **MCP (Model Context Protocol) server**, making it easy to integrate LinkedIn automation into AI agents and applications.

### Why ConnectSafely.ai?

✅ **Comprehensive Tool Suite** - 20+ LinkedIn automation tools  
✅ **MCP Integration** - Standardized protocol for AI agent integration  
✅ **Enterprise-Grade** - Reliable, scalable, and production-ready  
✅ **Easy Setup** - Simple API key authentication  
✅ **Active Support** - Regular updates and community support

**Get your API key:** [https://connectsafely.ai/api-key](https://connectsafely.ai/mcp-server)

---

## 🚀 Features

- **🤖 AI-Powered Agent** - Uses Google Gemini 2.5 Flash for intelligent task execution
- **🔌 ConnectSafely MCP Integration** - Direct connection to ConnectSafely.ai's MCP server
- **🛠️ Full Tool Access** - No limitations on which ConnectSafely tools you can use
- **💬 Interactive Mode** - Natural language REPL for conversational interactions
- **📝 Non-Interactive Mode** - Command-line support for scripts and automation
- **🧠 Persistent Memory** - Remembers context across conversations using SQLite
- **📊 Tool Transparency** - See which ConnectSafely tools were used for each request
- **🔄 Auto-Discovery** - Automatically discovers and loads all available ConnectSafely tools

---

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **ConnectSafely.ai API Key** - Get yours at [https://connectsafely.ai/api-key](https://connectsafely.ai/mcp-server)
- **Google Generative AI API Key** - Get yours at [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)

---

## 🛠️ Installation

1. **Navigate to the MCP directory:**

   ```bash
   cd extract-linkedin-premium-users-from-linkedin-groups/mcp/
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Create a `.env` file** in the `mcp` directory:

   ```env
   # ConnectSafely.ai API Key (Required)
   # Get yours at: https://connectsafely.ai/
   CONNECTSAFELY_API_KEY=your_connectsafely_api_key_here

   # Google Generative AI API Key (Required)
   # Get yours at: https://aistudio.google.com/api-keys
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
   ```

4. **Build the project:**

   ```bash
   bun run build
   ```

---

## 🎯 Usage

### Interactive Mode (Recommended)

Start the agent in interactive mode for a conversational experience:

```bash
bun start
# or
bun run dev  # For development with auto-reload
```

Once started, you'll see:

```
══════════════════════════════════════════════════════════════════════
🤖 LinkedIn Automation Agent - Interactive Mode
══════════════════════════════════════════════════════════════════════
✨ Full access to ALL ConnectSafely MCP tools (23 tools available)
💡 Type your requests naturally, or "exit" to quit
📝 Type "list-tools" to see all available tools
📝 Example: "Get 10 premium members from https://linkedin.com/groups/123"

>
```

**Example Commands:**

```
> Get 10 premium members from https://linkedin.com/groups/9357376
> Search for posts about "AI automation" from the last 7 days
> Get profile information for https://linkedin.com/in/username
> Send a connection request to https://linkedin.com/in/username with message "Hi, let's connect!"
> list-tools
> exit
```

### Non-Interactive Mode

Execute a single command and exit:

```bash
bun start -- "Get 10 premium members from group 9357376"
```

Or with the compiled version:

```bash
node dist/index.js "Search for posts about TypeScript"
```

### List Available ConnectSafely Tools

View all available tools from ConnectSafely.ai:

```bash
bun run list-tools
```

This will display all ConnectSafely LinkedIn automation tools available through the MCP server.

---

## 🔧 Available ConnectSafely Tools

The agent automatically discovers and loads **ALL** tools from ConnectSafely.ai's MCP server. Common tool categories include:

### Group Operations
- Get group members by URL or ID
- Extract member details (name, headline, profile, premium status, verified status)
- Handle pagination for large groups
- Filter and analyze group members

### Post Operations
- Search posts by keywords with advanced filters
- Scrape post details (content, engagement metrics, author info)
- Get all comments from posts with pagination
- Comment on posts
- React to posts (LIKE, PRAISE, APPRECIATION, EMPATHY, INTEREST, ENTERTAINMENT)
- Create, edit, or delete posts

### Profile Operations
- Fetch comprehensive profile information
- Get profile's latest posts and activity
- Check relationship status with profiles
- Follow/unfollow profiles
- View profile connections

### Messaging & Connections
- Send LinkedIn messages (normal or InMail)
- Send connection requests with custom messages
- Check message support for profiles
- Manage conversation threads
- Reply to messages

### Account Management
- Check account status and warmup status
- View activity history
- Manage account settings
- Monitor account health

**Note:** The exact tools available depend on your ConnectSafely.ai subscription. Use `list-tools` to see all tools available to your account.

---

## 🏗️ Architecture

```
User Input (Natural Language)
    ↓
AI Agent (Google Gemini 2.5 Flash)
    ↓
Tool Selection & Execution
    ↓
ConnectSafely.ai MCP Server
    ↓
LinkedIn API Operations
    ↓
Results Processing
    ↓
Response to User
```

### Key Components

1. **MCP Client** (`src/mcp/connectsafely-client.ts`)
   - Connects to ConnectSafely.ai's MCP server
   - Discovers and loads all available tools
   - Handles authentication via API key

2. **AI Agent** (`src/agent/linkedin-group-members-fetcher-agent.ts`)
   - Powered by Google Gemini 2.5 Flash
   - Has full access to all ConnectSafely tools
   - Includes persistent memory for context retention

3. **CLI Interface** (`src/index.ts`)
   - Interactive REPL mode
   - Non-interactive command-line mode
   - Tool usage transparency

---

## 📁 Project Structure

```
mcp/
├── src/
│   ├── agent/
│   │   └── linkedin-group-members-fetcher-agent.ts  # AI agent definition
│   ├── mcp/
│   │   └── connectsafely-client.ts                 # ConnectSafely MCP client
│   ├── tool-list/
│   │   └── list-tools.ts                            # Tool listing utility
│   └── index.ts                                      # CLI entry point
├── dist/                                             # Compiled JavaScript
├── package.json                                      # Dependencies and scripts
├── tsconfig.json                                     # TypeScript configuration
├── .env                                              # Environment variables (create this)
└── README.md                                         # This file
```

---

## 🔐 Environment Variables

### Required

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `CONNECTSAFELY_API_KEY` | Your ConnectSafely.ai API key | [https://connectsafely.ai/](https://connectsafely.ai/mcp-server) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys) |

---

## 📝 Example Workflows

### Extract Premium Members from a LinkedIn Group

```
> Get 10 premium members from https://linkedin.com/groups/9357376
```

The agent will:
1. Use ConnectSafely's group member extraction tool
2. Filter for premium members
3. Return member details

### Search and Engage with Posts

```
> Search for posts about "AI automation" from the last week and get the top 5
```

The agent will:
1. Use ConnectSafely's post search tool
2. Filter by date and relevance
3. Return post details

### Send Connection Requests

```
> Send a connection request to https://linkedin.com/in/username with message "Hi, interested in connecting!"
```

The agent will:
1. Use ConnectSafely's connection request tool
2. Send the request with your custom message
3. Confirm success

---

## 🐛 Troubleshooting

### "Failed to connect to ConnectSafely MCP"

- **Check your API key:** Ensure `CONNECTSAFELY_API_KEY` is set correctly in your `.env` file
- **Verify API key validity:** Get a new key from [https://connectsafely.ai](https://connectsafely.ai/mcp-server)
- **Check network connection:** Ensure you can reach `https://mcp.connectsafely.ai`

### "API key not valid" (Google Generative AI)

- **Check your API key:** Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly
- **Verify API key:** Get a new key from [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
- **Check API quotas:** Ensure your Google API key has available quota

### "No tools found"

- **Verify ConnectSafely subscription:** Ensure your ConnectSafely.ai account has access to tools
- **Check API key permissions:** Your API key must have access to the MCP server
- **Try reconnecting:** Restart the agent to reconnect to ConnectSafely MCP

---

## 📚 Learn More

- **ConnectSafely.ai Website:** [https://connectsafely.ai](https://connectsafely.ai)
- **ConnectSafely MCP Server:** [https://connectsafely.ai](https://connectsafely.ai/mcp-server)
- **Mastra Framework:** [https://mastra.ai](https://mastra.ai)
- **Model Context Protocol:** [https://modelcontextprotocol.io](https://modelcontextprotocol.io)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- **[ConnectSafely.ai](https://connectsafely.ai)** - For providing the comprehensive LinkedIn automation MCP server
- **Mastra** - For the excellent AI agent framework
- **Google Gemini** - For the powerful language model

---

**Built with ❤️ using ConnectSafely.ai**
