# LinkedIn Search → Google Sheets Export Agent

An intelligent AI agent system that searches LinkedIn profiles and exports the results to Google Sheets or JSON files. Built with multiple agentic frameworks to demonstrate different approaches to the same problem.

## Overview

This project provides multiple implementations of an AI-powered agent that automates LinkedIn profile searching and data export. Search by keywords, location, and job title, then export directly to Google Sheets for further analysis or outreach campaigns. All implementations are powered by [ConnectSafely.ai](https://connectsafely.ai) for secure and compliant LinkedIn data access.

### What It Does

The agent automates the entire workflow of:

1. **Searching for People** - Finds LinkedIn profiles by keywords, location, and job title
2. **Formatting Results** - Normalizes profile data for consistent export
3. **Exporting to Sheets** - Directly appends results to Google Sheets
4. **Exporting to JSON** - Saves results locally as JSON files
5. **Maintaining Context** - Remembers previous results for follow-up commands

### Why It Matters

Building lead lists and prospect databases traditionally involves:

- **Manual Searching**: Hours browsing LinkedIn for the right profiles
- **Copy-Paste Work**: Tediously copying data into spreadsheets
- **Inconsistent Data**: Different formats and missing fields
- **Rate Limiting**: Risk of account restrictions from manual scraping
- **Time Waste**: Repetitive tasks that could be automated

This agent solves all these problems by automating the entire process with AI intelligence and platform-compliant API access.

## Project Structure

This repository contains agentic framework implementations using different approaches:

### Agentic Framework Implementations

**Location**: [`agentic/`](agentic/)

**[Read the comprehensive agentic framework guide →](agentic/README.md)**

#### Available Frameworks

| Framework                           | Language   | UI        | Key Features                                  |
| ----------------------------------- | ---------- | --------- | --------------------------------------------- |
| **[AutoGen](agentic/autogen/)**     | Python     | Streamlit | Modular architecture, single assistant agent  |
| **[CrewAI](agentic/crewai/)**       | Python     | Streamlit | Unified agent, task-based execution           |
| **[LangGraph](agentic/langGraph/)** | TypeScript | CLI       | Stateful workflows, multi-step reasoning      |
| **[Mastra](agentic/mastra/)**       | TypeScript | Mastra UI | Agent orchestration, built-in memory/storage  |

Each framework implementation includes:

- Detailed README with setup instructions
- Complete code examples
- Framework-specific best practices
- Troubleshooting guides

## Quick Start

### Prerequisites

- **ConnectSafely.ai API Token**: Get yours at [connectsafely.ai](https://connectsafely.ai)
- **Google Gemini API Key**: Get yours at [Google AI Studio](https://aistudio.google.com/)
- **Google OAuth Credentials** (optional): For Sheets export functionality (Client ID, Client Secret, Refresh Token)

### Choose Your Implementation

1. **Python + Web UI**: [AutoGen](agentic/autogen/) or [CrewAI](agentic/crewai/)
2. **TypeScript + CLI/UI**: [LangGraph](agentic/langGraph/) or [Mastra](agentic/mastra/)

### Getting Started

1. **Read the Framework Guide**: Start with the [agentic framework overview](agentic/README.md)
2. **Choose a Framework**: Select based on your language preference and needs
3. **Follow Setup Guide**: Each implementation has detailed setup instructions
4. **Get API Keys**: Set up ConnectSafely.ai and Google Gemini API keys
5. **Configure Google Sheets** (optional): Set up Google OAuth credentials for Sheets export (see framework-specific READMEs for detailed setup)

## ConnectSafely.ai Integration

All implementations use [ConnectSafely.ai](https://connectsafely.ai) for secure LinkedIn data access.

### Why ConnectSafely.ai?

- **Secure**: Bearer token-based authentication
- **Compliant**: Follows LinkedIn's terms of service
- **Rich Data**: Returns comprehensive profile information
- **Reliable**: Built-in rate limiting and error handling
- **No Cookies**: No need to manage LinkedIn session cookies

### Required API Endpoints

All implementations use these ConnectSafely.ai endpoints:

- `POST /linkedin/search/geo` - Convert location names to geographic IDs
- `POST /linkedin/search/people` - Search for LinkedIn profiles

## Use Cases

### Lead Generation

Search for decision-makers and export to Sheets for sales outreach campaigns.

### Recruiting

Build candidate pipelines by searching for professionals with specific skills and experience.

### Market Research

Analyze professional demographics across industries, locations, and roles.

### Competitive Intelligence

Track hiring patterns and team composition at target companies.

### Event Marketing

Build invite lists for webinars, conferences, or networking events.

## Key Features

### Across All Implementations

- **Natural Language Commands**: Interact with agents using plain English
- **Flexible Search**: Search by keywords, location, job title, or combination
- **Dual Export**: Export to Google Sheets, JSON, or both
- **Context Awareness**: Agents remember previous results for follow-up commands
- **Error Handling**: Gracefully handles API errors and edge cases

## Framework Comparison

### Python Frameworks

**AutoGen** - Best for modular codebases and extensible agents

- Clean separation of concerns
- Modular architecture (all files <100 lines)
- Single assistant agent pattern
- Easy to extend

**CrewAI** - Best for task-oriented workflows

- Multi-agent orchestration
- Built-in task management
- Unified agent with task execution
- Rich web interface

### TypeScript Frameworks

**LangGraph** - Best for complex stateful workflows

- State graph architecture
- Fine-grained control flow
- Excellent error recovery
- CLI-first interface

**Mastra** - Best for agent orchestration and tool integration

- Simple agent configuration
- Built-in memory/storage
- Tool integration
- Mastra UI interface

## Common Workflow

All implementations follow a similar workflow:

```
1. User Command: "Search for 50 CEOs in United States with title 'Head of Growth'"
   ↓
2. Agent Processes: Understands intent, selects tools
   ↓
3. ConnectSafely.ai API: Searches for profiles
   ↓
4. Agent Formats: Normalizes profile data
   ↓
5. User Command: "Export to Google Sheets"
   ↓
6. Agent Exports: Appends data to spreadsheet
   ↓
7. Results: User receives spreadsheet URL
```

## Documentation

### Main Documentation

- **[Agentic Framework Guide](agentic/README.md)** - Comprehensive overview of all framework implementations

### Framework-Specific Documentation

- [AutoGen README](agentic/autogen/README.md)
- [CrewAI README](agentic/crewai/README.md)
- [LangGraph README](agentic/langGraph/README.md)
- [Mastra README](agentic/mastra/README.md)

## Contributing

This is part of the `agentic-framework-examples` repository, demonstrating how different frameworks solve the same real-world problem. Each implementation:

- Uses the same ConnectSafely.ai API endpoints
- Provides the same core functionality
- Demonstrates framework-specific patterns and best practices
- Can be used as a reference for building similar agents

**Ready to get started?** Choose a framework above and follow its setup guide!
