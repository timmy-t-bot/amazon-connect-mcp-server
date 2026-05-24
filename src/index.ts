import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config/loader.js';
import { ConnectClientWrapper } from './connect/client.js';
import { registerTools } from './tools/index.js';

async function main() {
  const config = await loadConfig();
  if (!config) {
    console.error(
      'No configuration found. Run: npx amazon-connect-mcp-server init'
    );
    process.exit(1);
  }

  const connectClient = new ConnectClientWrapper(config.aws);
  const tools = registerTools(connectClient);
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  const server = new Server(
    {
      name: 'amazon-connect-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ handler, ...tool }) => tool),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolMap.get(request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
    return tool.handler(request.params.arguments);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
