// src/mcp/connectsafely-client.ts

import { MCPClient } from "@mastra/mcp";

/**
 * ConnectSafely MCP Client
 * 
 * Connects to ConnectSafely's MCP server to provide LinkedIn automation tools.
 * All tools are automatically discovered and converted to Mastra format.
 */

// Create and export the MCP client
export const connectSafelyMCP = new MCPClient({
  servers: {
    connectsafely: {
      url: new URL(
        `https://mcp.connectsafely.ai/?apiKey=${process.env.CONNECTSAFELY_API_TOKEN}`
      ),
    },
  },
});

/**
 * Get all available tools from ConnectSafely MCP server
 * 
 * @returns Promise<Record<string, any>> - All LinkedIn automation tools
 */
export async function getConnectSafelyTools() {
  try {
    const tools = await connectSafelyMCP.getTools();
    console.log(`✅ Connected to ConnectSafely MCP`);
    console.log(`📋 Found ${Object.keys(tools).length} LinkedIn tools\n`);
    return tools;
  } catch (error: any) {
    console.error("❌ Failed to connect to ConnectSafely MCP:", error.message);
    
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error("Invalid API key. Get yours at https://connectsafely.ai/mcp-server");
    }
    
    throw error;
  }
}

/**
 * List all available tool names
 */
export async function listConnectSafelyTools() {
  const tools = await getConnectSafelyTools();
  const toolNames = Object.keys(tools);
  
  console.log("Available ConnectSafely LinkedIn Tools:");
  toolNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  return toolNames;
}

/**
 * Disconnect from MCP server
 * Call this when shutting down your application
 */
export async function disconnectConnectSafely() {
  await connectSafelyMCP.disconnect();
  console.log("🔌 Disconnected from ConnectSafely MCP");
}
