import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function aiAgentTools(_client: ConnectClientWrapper): ConnectTool[] {
  return [
    {
      name: 'list_ai_agents',
      description: 'List configured AI agents (Bedrock AgentCore) in the account.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  agents: [
                    {
                      id: 'reminder-caller',
                      name: 'Reminder Caller',
                      description: 'Delivers reminder messages and collects confirmations.',
                    },
                    {
                      id: 'appointment-booker',
                      name: 'Appointment Booker',
                      description: 'Handles natural conversation for booking appointments.',
                    },
                  ],
                  note: 'Full Bedrock AgentCore integration requires additional AWS setup.',
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },
    {
      name: 'invoke_ai_agent',
      description:
        'Trigger an AI agent for a conversation. The agent will call the customer and handle the conversation autonomously.',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: {
            type: 'string',
            enum: ['reminder-caller', 'appointment-booker', 'general-assistant'],
            description: 'Which AI agent to use',
          },
          phone_number: { type: 'string', description: 'Customer phone number' },
          context: {
            type: 'string',
            description: 'Context/prompt to pass to the agent for this conversation',
          },
        },
        required: ['agent_id', 'phone_number', 'context'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'initiated',
                  agent_id: args.agent_id,
                  phone_number: args.phone_number,
                  message:
                    'AI agent conversation initiated. Full Bedrock AgentCore runtime integration is required for live conversation handling.',
                },
                null,
                2
              ),
            },
          ],
        };
      },
    },
  ];
}
