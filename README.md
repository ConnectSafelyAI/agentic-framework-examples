# Agentic Framework Examples

A comprehensive collection of AI agent implementations demonstrating the same use cases across different agent frameworks. All implementations are powered by [ConnectSafely.ai](https://connectsafely.ai) for secure LinkedIn automation.

## 🎯 Use Cases

This repository contains two main use cases, each implemented across multiple agent frameworks:

### 1. Job Seekers Reach Out to Hiring Managers

**Purpose**: Automate the job search process and help job seekers connect with hiring managers on LinkedIn.

**Capabilities**:

- Search for LinkedIn jobs by keywords and location
- Find hiring managers and recruiters at target companies
- Check connection status before sending requests
- Send personalized connection requests automatically
- Maintain context between commands for seamless workflows

**Use Cases**:

- **Job Seekers**: Automate finding jobs and reaching out to hiring managers
- **Career Changers**: Quickly identify opportunities in new industries
- **Passive Job Seekers**: Stay informed about opportunities without manual searching
- **Recruiters**: Find and connect with hiring managers at target companies
- **Sales Professionals**: Identify decision-makers at companies with open positions

**Location**: `job-seekers-reach-out-to-hiring-managers/`

---

### 2. Extract LinkedIn Premium Users from LinkedIn Groups

**Purpose**: Extract and filter high-value LinkedIn group members (Premium and Verified users) for lead generation.

**Capabilities**:

- Fetch members from LinkedIn groups you're part of
- Intelligently filter for Premium subscribers and Verified users
- Export filtered leads to Google Sheets
- Multi-agent workflow for data extraction and analysis
- Automated profile analysis and validation

**Use Cases**:

- **Sales Teams**: Identify high-value prospects from LinkedIn groups
- **Marketers**: Find premium members for targeted campaigns
- **Recruiters**: Source candidates with verified profiles
- **Business Development**: Discover decision-makers in industry groups
- **Lead Generation**: Automate finding potential customers

**Location**: `extract-linkedin-premium-users-from-linkedin-groups/`

---

## 🚀 Available Platforms

Each use case is implemented across multiple agent frameworks, allowing you to compare approaches and choose the best fit for your needs.

### Job Seekers → Hiring Managers

| Platform      | Language   | Interface         | Location                                                      |
| ------------- | ---------- | ----------------- | ------------------------------------------------------------- |
| **CrewAI**    | Python     | Streamlit Web UI  | `job-seekers-reach-out-to-hiring-managers/agentic/crewai/`    |
| **LangGraph** | TypeScript | CLI (Interactive) | `job-seekers-reach-out-to-hiring-managers/agentic/langGraph/` |
| **Mastra**    | TypeScript | CLI (Interactive) | `job-seekers-reach-out-to-hiring-managers/agentic/mastra/`    |

### Extract Premium Users from Groups

| Platform      | Language   | Interface         | Location                                                                 |
| ------------- | ---------- | ----------------- | ------------------------------------------------------------------------ |
| **CrewAI**    | Python     | Streamlit Web UI  | `extract-linkedin-premium-users-from-linkedin-groups/agentic/crewai/`    |
| **LangGraph** | TypeScript | CLI (Interactive) | `extract-linkedin-premium-users-from-linkedin-groups/agentic/langGraph/` |
| **Mastra**    | TypeScript | CLI (Interactive) | `extract-linkedin-premium-users-from-linkedin-groups/agentic/mastra/`    |
| **Agno**      | Python     | Streamlit Web UI  | `extract-linkedin-premium-users-from-linkedin-groups/agentic/agno/`      |
| **MCP**       | TypeScript | MCP Server        | `extract-linkedin-premium-users-from-linkedin-groups/mcp/`               |

---

## 📊 Platform Comparison

### CrewAI

- **Language**: Python
- **Interface**: Streamlit Web UI
- **Best For**: Python developers, web-based workflows, multi-agent systems
- **Strengths**:
  - Rich web interface
  - Multi-agent orchestration
  - Easy Python integration
  - Built-in task management

### LangGraph

- **Language**: TypeScript
- **Interface**: CLI (Interactive)
- **Best For**: TypeScript/Node.js developers, stateful workflows, complex routing
- **Strengths**:
  - State graph architecture
  - Fine-grained control flow
  - Excellent for complex workflows
  - TypeScript type safety

### Mastra

- **Language**: TypeScript
- **Interface**: CLI (Interactive)
- **Best For**: TypeScript developers, simple agent setups, rapid prototyping
- **Strengths**:
  - Simple agent configuration
  - Built-in memory/storage
  - Fast development
  - Clean API

### Agno

- **Language**: Python
- **Interface**: Streamlit Web UI
- **Best For**: Python developers, workflow-based systems
- **Strengths**:
  - Workflow configuration
  - Python-native
  - Web interface

### MCP (Model Context Protocol)

- **Language**: TypeScript
- **Interface**: MCP Server
- **Best For**: Integration with MCP-compatible clients (Claude Desktop, etc.)
- **Strengths**:
  - Standard protocol
  - Client-agnostic
  - Easy integration

---

## 🔌 ConnectSafely.ai Integration

All implementations use the [ConnectSafely.ai](https://connectsafely.ai) API for secure and reliable LinkedIn automation.

### Why ConnectSafely.ai?

- **Safe & Compliant**: Handles LinkedIn session management and rate limiting automatically
- **Rich Data**: Returns detailed profile information including premium status, badges, and verification
- **Simple API**: Easy-to-use endpoints for all LinkedIn operations
- **Reliable**: Built to handle large-scale operations with proper error handling
- **No LinkedIn API Hassle**: No need to manage LinkedIn API credentials directly

### Required API Key

All implementations require a `CONNECTSAFELY_API_TOKEN`. Get yours from the [ConnectSafely Dashboard](https://connectsafely.ai/dashboard).

---

## 🚀 Quick Start

### Prerequisites

- **For Python implementations**: Python 3.10+ and [uv](https://docs.astral.sh/uv/)
- **For TypeScript implementations**: Node.js 18+ and [bun](https://bun.sh/) or npm
- **API Keys**:
  - `CONNECTSAFELY_API_TOKEN` (required for all)
  - `GEMINI_API_KEY` (for AI agents)
  - `GOOGLE_SHEETS_CREDENTIALS` (for Google Sheets export, if applicable)

### Getting Started

1. **Choose a use case** from the list above
2. **Select a platform** that matches your preferences
3. **Navigate to the implementation directory**
4. **Follow the platform-specific README** for detailed setup instructions

Example:

```bash
# For CrewAI implementation of Job Search
cd job-seekers-reach-out-to-hiring-managers/agentic/crewai
# Follow the README.md in that directory
```

---

## 📁 Repository Structure

```
agentic-framework-examples/
├── job-seekers-reach-out-to-hiring-managers/
│   └── agentic/
│       ├── crewai/          # CrewAI implementation
│       ├── langGraph/        # LangGraph implementation
│       └── mastra/           # Mastra implementation
│
├── extract-linkedin-premium-users-from-linkedin-groups/
│   ├── agentic/
│   │   ├── crewai/          # CrewAI implementation
│   │   ├── langGraph/       # LangGraph implementation
│   │   ├── mastra/          # Mastra implementation
│   │   └── agno/            # Agno implementation
│   └── mcp/                 # MCP Server implementation
│
├── LICENSE
└── README.md (this file)
```

---

## 🎓 Learning Resources

Each implementation includes:

- **Detailed README** with setup instructions
- **Code examples** demonstrating best practices
- **Workflow documentation** explaining the agent architecture
- **Troubleshooting guides** for common issues

### Recommended Learning Path

1. **Start with CrewAI** (Python, Web UI) - Easiest to get started
2. **Try LangGraph** (TypeScript, CLI) - Learn stateful workflows
3. **Explore Mastra** (TypeScript, CLI) - Simple agent setup
4. **Compare approaches** - See how different frameworks solve the same problem

---

## 🤝 Contributing

This repository demonstrates different agent frameworks for the same use cases. Contributions are welcome!

### Contributing Ideas

- Add new agent frameworks
- Improve existing implementations
- Add new use cases
- Enhance documentation
- Fix bugs or improve error handling

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [ConnectSafely.ai](https://connectsafely.ai) for providing the LinkedIn API infrastructure
- All the agent framework communities for their excellent tools and documentation

---

## 📚 Additional Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Mastra Documentation](https://mastra.ai/docs)
- [ConnectSafely.ai API Docs](https://connectsafely.ai/docs)

---

**Happy Building! 🚀**
