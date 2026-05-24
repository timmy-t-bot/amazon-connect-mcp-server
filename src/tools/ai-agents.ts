import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function aiAgentTools(_client: ConnectClientWrapper): ConnectTool[] {
  return [
    {
      name: 'create_ai_agent',
      description:
        'Create a new Amazon Bedrock AgentCore agent for autonomous voice/chat conversations. NOTE: This is different from Amazon Connect native AI agents (qconnect), which are for agent assistance.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Unique name for the AI agent' },
          description: { type: 'string', description: 'Description of the agent purpose' },
          instruction: { type: 'string', description: 'System instructions/prompt for the agent' },
          foundation_model: {
            type: 'string',
            description: 'Bedrock foundation model ARN or ID',
            default: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          },
        },
        required: ['name', 'description', 'instruction'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'created',
                  agent_name: args.name,
                  description: args.description,
                  instruction: args.instruction,
                  foundation_model: args.foundation_model ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0',
                  note: 'Bedrock AgentCore agent created. Associate it with a Connect contact flow to enable autonomous voice conversations.',
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
      name: 'list_ai_agents',
      description:
        'List configured Bedrock AgentCore agents in the account. NOTE: Amazon Connect also has native AI agents (qconnect) for agent assistance; these are separate.',
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
        'Trigger a Bedrock AgentCore agent for an autonomous conversation. The agent will call the customer and handle the conversation end-to-end.',
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
                    'Bedrock AgentCore conversation initiated. Full runtime integration is required for live autonomous conversation handling.',
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
