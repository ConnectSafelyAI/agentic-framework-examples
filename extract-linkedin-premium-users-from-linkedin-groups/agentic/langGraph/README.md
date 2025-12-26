# LinkedIn Premium Members Extractor - LangGraph v0.2.x

**Latest LangGraph implementation** using modern patterns: `Annotation`, `tool()`, and simplified StateGraph.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your API keys

# 3. Run the agent
npm run dev -- "Fetch premium members from group 12345"
```

## 📁 Project Structure

```
langgraph/
├── agents/
│   └── linkedin-premium-agent.ts    # StateGraph with Annotation
├── tools/
│   ├── linkedin/
│   │   └── index.ts                 # LinkedIn tools
│   └── googlesheet/
│       └── index.ts                 # Google Sheets tool
├── types/
│   └── index.ts                     # Annotation-based state
├── index.ts                         # Main entry point
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── COMPARISON.md
└── QUICKSTART.md
```

## ✨ Latest LangGraph Features

### 1. **Annotation-based State**
```typescript
import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});
```

### 2. **Modern tool() Function**
```typescript
import { tool } from "@langchain/core/tools";

export const myTool = tool(
  async ({ param1, param2 }) => "result",
  {
    name: "my-tool",
    description: "...",
    schema: z.object({}),
  }
);
```

### 3. **Simplified StateGraph**
```typescript
const workflow = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", new ToolNode(allTools))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");
```

## 🛠️ Available Tools

1. **fetch-linkedin-group-members** - Single batch pagination
2. **fetch-all-linkedin-group-members** - Auto-pagination
3. **fetch-group-members-by-url** - URL to groupId resolver
4. **filter-premium-verified-members** - Filter Premium/Verified
5. **complete-group-members-workflow** - Fetch + filter
6. **google-sheets** - Save to Google Sheets

## 💡 Example Usage

```bash
# Fetch premium members
npm run dev -- "Fetch all premium members from group 12345"

# Save to Google Sheets
npm run dev -- "Get premium members from group 12345 and save to sheets"

# From URL
npm run dev -- "Extract from https://www.linkedin.com/groups/12345"
```

## 🔀 Graph Flow

```
START → agent → shouldContinue?
                ├─ has tool_calls → tools → agent
                └─ no tool_calls → END
```

## 🔐 Environment Variables

```env
CONNECTSAFELY_API_TOKEN=your_token
GOOGLE_API_KEY=your_google_key
GOOGLE_SHEETS_API_TOKEN=your_sheets_token  # Optional
```

## 🆚 Why LangGraph?

✅ **Latest patterns** (v0.2.x)  
✅ **Better type safety** with Annotation  
✅ **Cleaner code** with tool()  
✅ **Production-ready**  
✅ **Full control** over workflow  

## 📚 Learn More

- [LangGraph Docs](https://langchain-ai.github.io/langgraphjs/)
- [Annotation Guide](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#state-schema)
- [Tool Guide](https://js.langchain.com/docs/modules/tools/)

## 📄 License

ISC