# Job Search → Hiring Manager Outreach Agent

An intelligent AI agent system that automates LinkedIn job search and hiring manager outreach, helping job seekers efficiently find opportunities and connect with decision-makers. Built with multiple agentic frameworks to demonstrate different approaches to the same problem.

## 🎯 Overview

This project provides multiple implementations of an AI-powered agent that automates the entire job search workflow: finding relevant positions, identifying hiring managers, and sending personalized connection requests. All implementations are powered by [ConnectSafely.ai](https://connectsafely.ai) for secure and compliant LinkedIn automation.

### What It Does

The agent automates the entire workflow of:

1. **Searching for Jobs** - Finds LinkedIn job postings by keywords, location, and criteria
2. **Finding Hiring Managers** - Identifies hiring managers, recruiters, and decision-makers at target companies
3. **Checking Connections** - Verifies connection status before sending requests
4. **Sending Requests** - Automatically sends personalized connection requests to hiring managers
5. **Maintaining Context** - Remembers previous results for seamless follow-up commands

### Why It Matters

Job searching is one of the most stressful and time-consuming activities for professionals. Traditional methods involve:

- **Time-Consuming**: Hours browsing job boards and LinkedIn manually
- **Repetitive Tasks**: Crafting similar connection requests for each opportunity
- **Research Overhead**: Identifying the right companies, roles, and hiring managers
- **Context Switching**: Jumping between multiple platforms and tools
- **Missed Opportunities**: Losing track of applications and follow-ups

This agent solves all these problems by automating the entire process with AI intelligence, reducing weeks of work to days.

## 📁 Project Structure

This repository contains agentic framework implementations using different approaches:

### Agentic Framework Implementations

Multiple implementations using different agent frameworks, each demonstrating different approaches to the same problem:

**Location**: [`agentic/`](agentic/)

📖 **[Read the comprehensive agentic framework guide →](agentic/README.md)**

#### Available Frameworks

| Framework                           | Language   | UI        | Location                                    |
| ----------------------------------- | ---------- | --------- | ------------------------------------------- |
| **[AutoGen](agentic/autogen/)**     | Python     | Streamlit | Modular architecture, single assistant agent |
| **[CrewAI](agentic/crewai/)**       | Python     | Streamlit | Unified agent, task-based execution          |
| **[LangGraph](agentic/langGraph/)** | TypeScript | CLI       | Stateful workflows, multi-step reasoning     |
| **[Mastra](agentic/mastra/)**       | TypeScript | MASTRA UI | Agent orchestration, tool integration        |

Each framework implementation includes:

- Detailed README with setup instructions
- Complete code examples
- Framework-specific best practices
- Troubleshooting guides

## 🚀 Quick Start

### Prerequisites

- **ConnectSafely.ai API Token**: Get yours at [connectsafely.ai](https://connectsafely.ai)
- **Google Gemini API Key**: Get yours at [Google AI Studio](https://aistudio.google.com/)

### Choose Your Implementation

1. **Python + Web UI**: [AutoGen](agentic/autogen/) or [CrewAI](agentic/crewai/)
2. **TypeScript + CLI/UI**: [LangGraph](agentic/langGraph/) or [Mastra](agentic/mastra/)

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
- **📊 Rich Data**: Returns comprehensive job, company, and profile information
- **⚡ Reliable**: Built-in rate limiting and error handling
- **🔗 Vanity Name Support**: Automatic extraction and validation of LinkedIn profile IDs

### Required API Endpoints

All implementations use these ConnectSafely.ai endpoints:

- `POST /linkedin/search/geo` - Convert location names to geographic IDs
- `POST /linkedin/search/jobs` - Search for LinkedIn jobs
- `POST /linkedin/search/companies/details` - Get company information
- `POST /linkedin/search/people` - Find hiring managers/recruiters
- `POST /linkedin/profile` - Get detailed profile information
- `GET /linkedin/relationship/{profileId}` - Check connection status
- `POST /linkedin/connect` - Send connection requests

## 💡 Use Cases

### Active Job Search

Automate finding jobs and reaching out to hiring managers for active job seekers.

### Career Change

Quickly explore opportunities in new industries and connect with decision-makers.

### Passive Job Seeking

Stay informed about opportunities and build relationships with hiring managers before actively searching.

### Recruiting

Find and connect with hiring managers at target companies for recruitment purposes.

### Sales Prospecting

Identify decision-makers at companies with open positions (potential expansion indicators).

## 🎨 Key Features

### Across All Implementations

- **Natural Language Commands**: Interact with agents using plain English
- **Context Awareness**: Agents remember previous results for follow-up commands
- **On-Demand Execution**: Only performs actions you explicitly request
- **Intelligent Tool Selection**: Automatically chooses the right tools for each task
- **Personalization**: Crafts personalized messages based on job and manager details
- **Connection Status Checking**: Prevents duplicate connection requests
- **Error Handling**: Gracefully handles API errors and edge cases

## 📊 Framework Comparison

### Python Frameworks

**AutoGen** - Best for modular codebases and extensible agents

- Clean separation of concerns
- Modular architecture (all files <100 lines)
- Single assistant agent pattern
- Easy to extend

**CrewAI** - Best for task-oriented workflows and team-based agents

- Multi-agent orchestration
- Built-in task management
- Unified agent with task execution
- Rich web interface

### TypeScript Frameworks

**LangGraph** - Best for complex stateful workflows

- State graph architecture
- Fine-grained control flow
- Excellent error recovery
- Multi-step reasoning

**Mastra** - Best for agent orchestration and tool integration

- Simple agent configuration
- Built-in memory/storage
- Tool integration
- MASTRA UI interface

## 📚 Documentation

### Main Documentation

- **[Agentic Framework Guide](agentic/README.md)** - Comprehensive overview of all framework implementations

### Framework-Specific Documentation

- [AutoGen README](agentic/autogen/README.md)
- [CrewAI README](agentic/crewai/README.md)
- [LangGraph README](agentic/langGraph/README.md)
- [Mastra README](agentic/mastra/README.md)

## 🛠️ Common Workflow

All implementations follow a similar workflow:

```
1. User Command: "Find 5 software engineering jobs in Australia"
   ↓
2. Agent Processes: Understands intent, selects tools
   ↓
3. ConnectSafely.ai API: Searches for jobs
   ↓
4. Agent Analyzes: Extracts job details, company IDs
   ↓
5. User Command: "Find hiring managers for first 3 jobs"
   ↓
6. Agent Processes: Identifies companies, searches for managers
   ↓
7. ConnectSafely.ai API: Returns hiring manager profiles
   ↓
8. User Command: "Connect with all managers found"
   ↓
9. Agent Processes: Checks connection status, sends requests
   ↓
10. ConnectSafely.ai API: Sends personalized connection requests
    ↓
11. Results: User receives confirmation with profile URLs
```

## 🤝 Contributing

This is part of the `agentic-framework-examples` repository, demonstrating how different frameworks solve the same real-world problem. Each implementation:

- Uses the same ConnectSafely.ai API endpoints
- Provides the same core functionality
- Demonstrates framework-specific patterns and best practices
- Can be used as a reference for building similar agents


**Ready to get started?** Choose a framework above and follow its setup guide!
