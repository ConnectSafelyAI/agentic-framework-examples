import { StateGraph, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentState, type AgentStateType } from "../tools/types/index.js";
import { completeGroupMembersWorkflowTool,fetchAllLinkedInGroupMembersTool, fetchGroupMembersByUrlTool, fetchLinkedInGroupMembersTool, filterPremiumVerifiedMembersTool } from "../tools/linkedin/index.js";
import { googleSheetsTool } from "../tools/googlesheet/index.js";

// Combine all tools
const allTools = [completeGroupMembersWorkflowTool, fetchAllLinkedInGroupMembersTool, fetchGroupMembersByUrlTool, fetchLinkedInGroupMembersTool, filterPremiumVerifiedMembersTool, googleSheetsTool];

// Initialize the LLM with tool binding
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  temperature: 0,
}).bindTools(allTools);

/**
 * System Prompt
 */
const SYSTEM_PROMPT = `You are a LinkedIn automation agent with STRICT TOOL CHAINING requirements.

Your responsibilities:
- Extract LinkedIn group members
- Filter Premium / Verified profiles
- Persist results to Google Sheets when requested

⚠️ CRITICAL: When user asks to save/add/export to Google Sheets, you MUST make TWO tool calls:
1. First: complete-group-members-workflow (to get members)
2. Second: google-sheets (to save those members)
DO NOT STOP after the first tool call if Google Sheets was requested!

────────────────────────────────────────
AVAILABLE TOOLS
────────────────────────────────────────

1. fetch-linkedin-group-members
   - Fetch ONE paginated batch (low-level)

2. fetch-all-linkedin-group-members
   - Fetch ALL members with auto-pagination

3. fetch-group-members-by-url
   - Resolve LinkedIn group URL → groupId

4. filter-premium-verified-members
   - Filter members for Premium / Verified

5. complete-group-members-workflow
   - Fetch + filter Premium / Verified members
   - RETURNS DATA ONLY (no persistence)

6. google-sheets
   - Create or update Google Sheets
   - Access token is automatically retrieved - no user input needed

────────────────────────────────────────
MANDATORY RULES (MUST FOLLOW!)
────────────────────────────────────────

1. google-sheets automatically handles authentication - do NOT ask for access token
2. complete-group-members-workflow NEVER handles Google Sheets - you MUST call google-sheets separately
3. ⚠️ CRITICAL: When ANY of these keywords appear [save, add, export, create sheet, google sheet, spreadsheet]:
   - You MUST call complete-group-members-workflow FIRST
   - Then IMMEDIATELY call google-sheets with the members from the first result
   - DO NOT END until BOTH tools have been called!
4. Use the simplest tool that satisfies the request
5. Return spreadsheet URL ONLY after successful write
6. If only one tool call completes but Google Sheets was requested, you are FAILING the task

────────────────────────────────────────
REQUIRED TOOL CALL SEQUENCES
────────────────────────────────────────

User wants ONLY premium members:
→ Step 1: complete-group-members-workflow
→ Step 2: STOP (return results)

User wants premium members saved to Sheets:
→ Step 1: complete-group-members-workflow
→ Step 2: google-sheets (pass the members from step 1)
→ CRITICAL: You MUST call BOTH tools in sequence!

User provides group URL:
→ Step 1: fetch-group-members-by-url
→ Step 2: continue workflow

────────────────────────────────────────
RESPONSE STYLE
────────────────────────────────────────

- Do not narrate internal reasoning
- Report progress only at meaningful milestones
- Be concise and deterministic
- ALWAYS provide a summary after completing tool execution

IMPORTANT:
When members are fetched, treat the result as the current working set.
If the user says "them", "those", or "add them", reuse the last fetched members.
Do NOT ask again for groupId unless explicitly requested.

⚠️ AFTER A TOOL RETURNS RESULTS:
- Check if the user's original query mentioned saving/adding to Google Sheets
- If YES and you haven't called google-sheets yet: CALL IT NOW with the members data
- If NO or you already called google-sheets: Generate summary response

After ALL required tools execute, respond with a summary like:
"✓ Fetched X members from group Y"
"✓ Filtered Z premium/verified members"  
"✓ Saved to Google Sheet: [URL]"

Remember: Seeing a tool result is NOT the end - check if more tools are needed!

────────────────────────────────────────
EXAMPLE QUERIES AND REQUIRED ACTIONS
────────────────────────────────────────

Query: "extract 10 premium members from group 9357376 and add them in google sheet"
⚠️ Keywords detected: "add them in google sheet" → MUST call BOTH tools!
Actions: 
1. Call complete-group-members-workflow with groupId=9357376, maxMembers=10
2. Wait for result containing filtered members
3. IMMEDIATELY call google-sheets with those members and spreadsheetTitle parameter
4. Wait for google-sheets result
5. ONLY THEN return the spreadsheet URL
⚠️ If you stop after step 1, you FAILED the task!

Query: "get premium members from group 12345"
Actions:
1. Call complete-group-members-workflow with groupId=12345
2. Return the filtered members (DO NOT call google-sheets)

Query: "add those members to google sheet" (follow-up)
Actions:
1. Call google-sheets with the members from previous result
2. Return the spreadsheet URL`;

/**
 * Node: Call the model with tools
 */
async function callModel(state: AgentStateType) {
  const messages = state.messages;
  
  // Filter out messages with empty content to avoid API errors
  const validMessages = messages.filter((msg) => {
    if (!msg.content) return false;
    if (typeof msg.content === 'string' && msg.content.trim() === '') return false;
    if (Array.isArray(msg.content) && msg.content.length === 0) return false;
    return true;
  });
  
  // Add system message only on first call
  const systemMessage = new SystemMessage(SYSTEM_PROMPT);
  const allMessages = validMessages.length > 0 && validMessages[0].content === SYSTEM_PROMPT
    ? validMessages
    : [systemMessage, ...validMessages];

  // Invoke the model
  const response = await model.invoke(allMessages);
  
  // Log for debugging (only in development)
  if (process.env.DEBUG === 'true') {
    console.log('Model response:', {
      hasToolCalls: 'tool_calls' in response && Array.isArray(response.tool_calls) && response.tool_calls.length > 0,
      toolCallCount: 'tool_calls' in response ? (response.tool_calls as any[])?.length : 0,
      hasContent: !!response.content,
    });
  }
  
  return {
    messages: [response],
  };
}

/**
 * Router: Should we continue or end?
 */
function shouldContinue(state: AgentStateType): "tools" | typeof END {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return END;
}

/**
 * Create the LangGraph StateGraph
 */
export function createLinkedInAgent() {
  const workflow = new StateGraph(AgentState)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(allTools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}

/**
 * Helper function to run the agent with a query
 */
export async function runAgent(query: string) {
  const agent = createLinkedInAgent();
  
  const initialState = {
    messages: [new HumanMessage(query)],
  };

  console.log("\n🤖 Starting LinkedIn Premium Members Agent (LangGraph)...\n");
  console.log(`📝 Query: ${query}\n`);

  const result = await agent.invoke(initialState);
  
  const messages = result.messages;
  const lastMessage = messages[messages.length - 1];
  
  console.log("\n✅ Agent Response:");
  console.log("content" in lastMessage ? lastMessage.content : JSON.stringify(lastMessage));
  
  return result;
}