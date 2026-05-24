import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ConnectClientWrapper } from '../connect/client.js';
import { callTools } from './calls.js';
import { messagingTools } from './messaging.js';
import { instanceTools } from './instance.js';

export interface ConnectTool extends Tool {
  handler: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

export function registerTools(client: ConnectClientWrapper): ConnectTool[] {
  return [...callTools(client), ...messagingTools(client), ...instanceTools(client)];
}
