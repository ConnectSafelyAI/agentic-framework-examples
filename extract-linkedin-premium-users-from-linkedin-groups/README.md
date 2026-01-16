# Extract LinkedIn Premium Users from LinkedIn Groups

An intelligent AI agent system that automates the extraction and filtering of LinkedIn group members, specifically targeting Premium and Verified profiles for lead generation, sales prospecting, and networking.

## 🎯 Overview

This project provides multiple implementations of an AI-powered agent that extracts LinkedIn group members and intelligently filters for high-value profiles (Premium subscribers and Verified users). All implementations are powered by [ConnectSafely.ai](https://connectsafely.ai) for secure and compliant LinkedIn data access.

### What It Does

The agent automates the entire workflow of:

1. **Extracting Group Members** - Fetches members from any LinkedIn group you're part of
2. **Filtering Premium Users** - Identifies LinkedIn Premium subscribers automatically
3. **Filtering Verified Users** - Identifies verified LinkedIn profiles
4. **Exporting Data** - Saves filtered results to Google Sheets for further analysis

### Why It Matters

LinkedIn groups contain thousands of members, but finding high-value prospects (Premium and Verified users) manually is:

- **Time-Consuming**: Hours or days to browse through members
- **Error-Prone**: Easy to miss members or make filtering mistakes
- **Not Scalable**: Can't efficiently process multiple groups
- **Repetitive**: Same manual process for every group

This agent solves all these problems by automating the entire process with AI intelligence.

## 📁 Project Structure

This repository contains two main implementation approaches:

### 1. Agentic Framework Implementations

Multiple implementations using different agent frameworks, each demonstrating different approaches to the same problem:

**Location**: [`agentic/`](agentic/)

📖 **[Read the comprehensive agentic framework guide →](agentic/README.md)**

#### Available Frameworks

| Framework                           | Language   | UI              | Location                                   |
| ----------------------------------- | ---------- | --------------- | ------------------------------------------ |
| **[Agno](agentic/agno/)**           | Python     | Streamlit + CLI | Natural language interface, flexible modes |
| **[CrewAI](agentic/crewai/)**       | Python     | Streamlit       | Multi-agent workflow, task-based execution |
| **[LangGraph](agentic/langGraph/)** | TypeScript | CLI             | Stateful workflows, multi-step reasoning   |
| **[Mastra](agentic/mastra/)**       | TypeScript | CLI             | Agent orchestration, tool integration      |

Each framework implementation includes:

- Detailed README with setup instructions
- Complete code examples
- Framework-specific best practices
- Troubleshooting guides

### 2. MCP (Model Context Protocol) Implementation

An implementation using the Model Context Protocol, allowing integration with MCP-compatible clients like Claude Desktop.

**Location**: [`mcp/`](mcp/)

**Features**:

- MCP server implementation
- Full access to ConnectSafely.ai tools via MCP
- Client-agnostic design
- Easy integration with MCP-compatible applications

📖 **[Read the MCP implementation guide →](mcp/README.md)**

## 🚀 Quick Start

### Prerequisites

- **ConnectSafely.ai API Token**: Get yours at [connectsafely.ai](https://connectsafely.ai)
- **Google Gemini API Key**: Get yours at [Google AI Studio](https://aistudio.google.com/)
- **Google Sheets Credentials** (Optional): For exporting data to spreadsheets

### Choose Your Implementation

1. **Agentic Frameworks**: For building standalone applications

   - **Python + Web UI**: [Agno](agentic/agno/) or [CrewAI](agentic/crewai/)
   - **TypeScript + CLI**: [LangGraph](agentic/langGraph/) or [Mastra](agentic/mastra/)

2. **MCP Server**: For integration with MCP-compatible clients
   - [MCP Implementation](mcp/)

### Getting Started

1. **Read the Framework Guide**: Start with the [agentic framework overview](agentic/README.md) to understand all implementations
2. **Choose a Framework**: Select based on your language preference and needs
3. **Follow Setup Guide**: Each implementation has detailed setup instructions in its README
4. **Get API Keys**: Set up ConnectSafely.ai and Google Gemini API keys

## 🔌 ConnectSafely.ai Integration

All implementations use [ConnectSafely.ai](https://connectsafely.ai) for secure LinkedIn data access.

### Why ConnectSafely.ai?

- **🔐 Secure**: Bearer token-based authentication
- **🛡️ Compliant**: Follows LinkedIn's terms of service
- **📊 Rich Data**: Returns comprehensive profile information including premium status
- **⚡ Reliable**: Built-in rate limiting and error handling
- **🔄 Auto-Pagination**: Handles large groups seamlessly

### Required API Endpoints

All implementations use these ConnectSafely.ai endpoints:

- `POST /linkedin/groups/members` - Fetch group members with pagination
- Group URL resolution and ID extraction
- Premium and Verified status detection

## 💡 Use Cases

### Sales Prospecting

Extract premium members from industry-specific groups to build targeted prospect lists.

### Market Research

Analyze group demographics and premium member distribution across multiple groups.

### Recruiting

Source quality candidates with verified profiles from professional development groups.

### Networking

Identify key professionals and decision-makers for strategic connections.

### Lead Generation

Automate finding high-value prospects for outreach campaigns.

## 🎨 Key Features

### Across All Implementations

- **Natural Language Interface**: Interact with agents using plain English
- **Intelligent Filtering**: Automatically identifies Premium and Verified members
- **Google Sheets Export**: Seamlessly export filtered data
- **Auto-Pagination**: Handles groups of any size
- **URL Resolution**: Converts LinkedIn group URLs to IDs automatically
- **Context Awareness**: Agents remember previous results for follow-up commands

## 📊 Framework Comparison

### Python Frameworks

**Agno** - Best for natural language interfaces and flexible execution modes

- Streamlit web UI + CLI mode
- Simple API
- Intuitive tool selection

**CrewAI** - Best for multi-agent workflows and task-based execution

- Multi-agent orchestration
- Specialized task agents
- Rich web interface

### TypeScript Frameworks

**LangGraph** - Best for complex stateful workflows

- State graph architecture
- Fine-grained control flow
- Excellent error recovery

**Mastra** - Best for simple agent setups

- Clean API
- Built-in memory/storage
- Fast development

## 📚 Documentation

### Main Documentation

- **[Agentic Framework Guide](agentic/README.md)** - Comprehensive overview of all framework implementations
- **[MCP Implementation Guide](mcp/README.md)** - MCP server setup and usage

### Framework-Specific Documentation

- [Agno README](agentic/agno/README.md)
- [CrewAI README](agentic/crewai/README.md)
- [LangGraph README](agentic/langGraph/README.md)
- [Mastra README](agentic/mastra/README.md)

## 🛠️ Common Workflow

All implementations follow a similar workflow:

```
1. User provides group ID or URL
   ↓
2. Agent fetches group members via ConnectSafely.ai
   ↓
3. Agent filters for Premium/Verified members
   ↓
4. (Optional) Agent exports to Google Sheets
   ↓
5. User receives filtered results or spreadsheet URL
```

## 🤝 Contributing

This is part of the `agentic-framework-examples` repository, demonstrating how different frameworks solve the same real-world problem. Each implementation:

- Uses the same ConnectSafely.ai API endpoints
- Provides the same core functionality
- Demonstrates framework-specific patterns and best practices
- Can be used as a reference for building similar agents

## 📄 License

See LICENSE file in the repository root.

---

## 🚀 Next Steps

1. **Read the [Agentic Framework Guide](agentic/README.md)** to understand all implementations
2. **Choose a framework** that matches your preferences
3. **Follow the framework-specific README** for detailed setup
4. **Start extracting premium members** from LinkedIn groups!

**Ready to get started?** Choose a framework above and follow its setup guide!
