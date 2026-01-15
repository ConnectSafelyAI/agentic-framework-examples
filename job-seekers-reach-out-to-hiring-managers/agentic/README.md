# Job Search → Hiring Manager Outreach Agent

An intelligent AI agent that automates LinkedIn job search and hiring manager outreach, helping job seekers efficiently find opportunities and connect with decision-makers. Built with multiple agentic frameworks to demonstrate different approaches to the same problem.

## 🎯 What Is This Product?

This is an **AI-powered automation agent** that transforms the tedious, time-consuming process of job searching into a streamlined, intelligent workflow. Instead of manually searching for jobs, identifying hiring managers, and crafting personalized connection requests, this agent does it all automatically through natural language commands.

### Core Capabilities

The agent can:

- **🔍 Search for Jobs**: Find LinkedIn job postings by keywords, location, and other criteria
- **🏢 Get Company Details**: Retrieve comprehensive information about companies with open positions
- **👥 Find Hiring Managers**: Automatically identify hiring managers, recruiters, and decision-makers at target companies
- **📋 Fetch Profile Details**: Get detailed information about hiring managers to personalize outreach
- **🔗 Check Connection Status**: Verify if you're already connected before sending requests
- **✉️ Send Connection Requests**: Automatically send personalized connection requests to hiring managers

## 💡 Why Is This Important?

### The Problem

Job searching is one of the most stressful and time-consuming activities for professionals. Traditional job search involves:

1. **Manual Searching**: Spending hours browsing job boards and LinkedIn
2. **Research Overhead**: Identifying the right companies, roles, and hiring managers
3. **Repetitive Tasks**: Crafting similar connection requests and messages
4. **Context Switching**: Jumping between multiple platforms and tools
5. **Missed Opportunities**: Losing track of applications and follow-ups

### The Solution

This AI agent solves these problems by:

- **⏱️ Saving Time**: Automates repetitive tasks, reducing hours of work to minutes
- **🎯 Better Targeting**: Intelligently identifies the most relevant jobs and hiring managers
- **📝 Personalization**: Automatically crafts personalized connection requests based on job details
- **🔄 Consistency**: Maintains context across multiple interactions and workflows
- **📊 Scalability**: Process dozens of jobs and connections efficiently
- **🤖 Intelligence**: Uses AI to make smart decisions about which managers to connect with

### Real-World Impact

**For Job Seekers:**

- Reduce job search time from weeks to days
- Increase response rates with personalized outreach
- Never miss an opportunity due to manual tracking errors
- Focus on interviews instead of administrative tasks

**For Career Changers:**

- Quickly explore opportunities in new industries
- Identify decision-makers in target companies
- Build connections in new fields efficiently

**For Passive Job Seekers:**

- Stay informed about opportunities without constant manual checking
- Build relationships with hiring managers before actively searching
- Maintain professional network growth

## 🏗️ Framework Implementations

This project demonstrates the same use case implemented with **four different agentic frameworks**, allowing you to:

- **Compare Approaches**: See how different frameworks solve the same problem
- **Choose the Right Tool**: Select the framework that best fits your needs
- **Learn Best Practices**: Understand patterns and architectures across frameworks

### Available Implementations

| Framework                   | Language   | UI        | Key Features                                 |
| --------------------------- | ---------- | --------- | -------------------------------------------- |
| **[AutoGen](autogen/)**     | Python     | Streamlit | Modular architecture, single assistant agent |
| **[CrewAI](crewai/)**       | Python     | Streamlit | Unified agent, task-based execution          |
| **[LangGraph](langGraph/)** | TypeScript | CLI       | Stateful workflows, multi-step reasoning     |
| **[Mastra](mastra/)**       | TypeScript | CLI       | Agent orchestration, tool integration        |

### Framework Comparison

#### AutoGen

- **Best for**: Python developers, modular codebases
- **Strengths**: Clean separation of concerns, easy to extend
- **Architecture**: Single assistant agent with modular config
- **UI**: Streamlit web interface

#### CrewAI

- **Best for**: Task-oriented workflows, team-based agents
- **Strengths**: Built-in task management, agent collaboration
- **Architecture**: Unified agent with task execution
- **UI**: Streamlit web interface

#### LangGraph

- **Best for**: Complex stateful workflows, TypeScript projects
- **Strengths**: State management, conditional routing, error recovery
- **Architecture**: State graph with multi-step workflows
- **UI**: CLI interface

#### Mastra

- **Best for**: Agent orchestration, TypeScript ecosystems
- **Strengths**: Tool integration, agent coordination
- **Architecture**: Agent-based with tool orchestration
- **UI**: CLI interface

## 🔌 ConnectSafely.ai Integration

All implementations are built on top of **[ConnectSafely.ai](https://connectsafely.ai)**, a specialized platform that provides secure and reliable access to LinkedIn data.

### Why ConnectSafely.ai?

ConnectSafely.ai simplifies LinkedIn automation by:

- **🔐 Secure Authentication**: Bearer token-based authentication
- **🛡️ Rate Limit Management**: Built-in rate limiting and error handling
- **📊 Data Normalization**: Consistent data formats across all endpoints
- **🔗 Vanity Name Support**: Automatic extraction and validation of LinkedIn profile IDs
- **⚡ Reliability**: Handles LinkedIn API complexity behind the scenes

### Available Endpoints

All implementations use these ConnectSafely.ai API endpoints:

1. `POST /linkedin/search/geo` - Convert location names to geographic IDs
2. `POST /linkedin/search/jobs` - Search for LinkedIn jobs
3. `POST /linkedin/search/companies/details` - Get company information
4. `POST /linkedin/search/people` - Find hiring managers/recruiters
5. `POST /linkedin/profile` - Get detailed profile information
6. `GET /linkedin/relationship/{profileId}` - Check connection status
7. `POST /linkedin/connect` - Send connection requests

## 🚀 Getting Started

### Prerequisites

- **ConnectSafely.ai API Token**: Get yours at [connectsafely.ai](https://connectsafely.ai)
- **Google Gemini API Key**: Get yours at [Google AI Studio](https://aistudio.google.com/)

### Choose Your Framework

1. **Python + Web UI**: Use [AutoGen](autogen/) or [CrewAI](crewai/)
2. **TypeScript + CLI**: Use [LangGraph](langGraph/) or [Mastra](mastra/)

### Quick Start

Each framework has its own README with detailed setup instructions:

- [AutoGen Setup Guide](autogen/README.md)
- [CrewAI Setup Guide](crewai/README.md)
- [LangGraph Setup Guide](langGraph/README.md)
- [Mastra Setup Guide](mastra/README.md)

## 💬 How It Works

### Basic Workflow

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

### Key Features Across All Implementations

- **Natural Language Commands**: Interact with the agent using plain English
- **Context Awareness**: Agent remembers previous results and maintains conversation context
- **On-Demand Execution**: Only performs actions you explicitly request
- **Intelligent Tool Selection**: Automatically chooses the right tools for each task
- **Personalization**: Crafts personalized messages based on job and manager details
- **Error Handling**: Gracefully handles API errors and edge cases

## 🎨 Use Cases

### 1. Active Job Search

**Scenario**: You're actively looking for a new role

**Workflow**:

```
1. Find 20 software engineering jobs in your target location
2. Find hiring managers for the top 5 most interesting positions
3. Send personalized connection requests
4. Follow up with managers who accept
```

### 2. Industry Exploration

**Scenario**: You want to explore opportunities in a new industry

**Workflow**:

```
1. Find jobs in the target industry
2. Get company details to understand the market
3. Identify key decision-makers
4. Build connections before applying
```

### 3. Passive Networking

**Scenario**: You're not actively searching but want to grow your network

**Workflow**:

```
1. Find interesting companies in your field
2. Identify hiring managers and recruiters
3. Send connection requests with personalized messages
4. Build relationships for future opportunities
```

### 4. Targeted Company Outreach

**Scenario**: You have specific companies in mind

**Workflow**:

```
1. Search for jobs at target companies
2. Find hiring managers for those specific roles
3. Send highly personalized connection requests
4. Follow up with additional context
```

## 📊 Comparison: Which Framework Should You Use?

### Choose AutoGen if:

- ✅ You prefer Python
- ✅ You want a web UI (Streamlit)
- ✅ You value modular, maintainable code
- ✅ You want to extend the agent with custom logic

### Choose CrewAI if:

- ✅ You prefer Python
- ✅ You want a web UI (Streamlit)
- ✅ You need task-based workflows
- ✅ You plan to add multiple specialized agents

### Choose LangGraph if:

- ✅ You prefer TypeScript/JavaScript
- ✅ You need complex stateful workflows
- ✅ You want fine-grained control over agent flow
- ✅ You're building a CLI or backend service

### Choose Mastra if:

- ✅ You prefer TypeScript/JavaScript
- ✅ You need agent orchestration
- ✅ You want built-in tool management
- ✅ You're building a CLI or backend service

## 🛠️ Common Tools & Capabilities

All implementations provide the same core tools:

1. **`search_geo_location`** - Convert location names to IDs
2. **`search_jobs`** - Find LinkedIn jobs by keywords and location
3. **`get_company_details`** - Get detailed company information
4. **`search_hiring_managers`** - Find hiring managers at companies
5. **`fetch_profile_details`** - Get detailed profile information
6. **`check_connection_status`** - Check if already connected
7. **`send_connection_request`** - Send personalized connection requests

## 📚 Learn More

### Framework Documentation

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Mastra Documentation](https://mastra.ai/docs)

### ConnectSafely.ai

- [ConnectSafely.ai API Documentation](https://connectsafely.ai/docs)
- [ConnectSafely.ai Website](https://connectsafely.ai)

## 🤝 Contributing

This is part of the `agentic-framework-examples` repository, demonstrating how different agentic frameworks can solve the same real-world problem. Each implementation:

- Uses the same ConnectSafely.ai API endpoints
- Provides the same core functionality
- Demonstrates framework-specific patterns and best practices
- Can be used as a reference for building similar agents

## 📄 License

See LICENSE file in the repository root.

---

**Ready to get started?** Choose a framework above and follow its setup guide!
