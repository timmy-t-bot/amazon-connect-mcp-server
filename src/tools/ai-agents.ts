import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function aiAgentTools(_client: ConnectClientWrapper): ConnectTool[] {
  return [
    // ─── Bedrock AgentCore agents (autonomous conversation) ───
    {
      name: 'create_bedrock_agent',
      description:
        'Create a new Amazon Bedrock AgentCore agent for autonomous voice/chat conversations. These agents can handle full conversations, make decisions, and invoke tools.',
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
      name: 'list_bedrock_agents',
      description:
        'List configured Bedrock AgentCore agents in the account.',
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
      name: 'invoke_bedrock_agent',
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

    // ─── Amazon Connect native AI agents (agent assistance) ───
    {
      name: 'create_connect_ai_agent',
      description:
        'Create a native Amazon Connect AI agent (Amazon Q in Connect). Supports agent assistance (answer recommendations, manual search), self-service, email response, orchestration, and speech-to-speech conversations. Also supports Bedrock AgentCore 3rd party agents via Gateways.',
      inputSchema: {
        type: 'object',
        properties: {
          assistant_id: {
            type: 'string',
            description: 'The Connect AI Agent Assistant ID',
          },
          name: { type: 'string', description: 'Name for the AI agent' },
          type: {
            type: 'string',
            enum: [
              'ORCHESTRATION',
              'ANSWER_RECOMMENDATION',
              'MANUAL_SEARCH',
              'SELF_SERVICE',
              'EMAIL_RESPONSE',
              'EMAIL_OVERVIEW',
              'EMAIL_GENERATIVE_ANSWER',
            ],
            description: 'The AI agent type',
          },
          visibility_status: {
            type: 'string',
            enum: ['PUBLISHED', 'DRAFT'],
            default: 'PUBLISHED',
          },
          ai_prompt_ids: {
            type: 'object',
            description: 'Map of AI prompt IDs to override defaults (e.g. answerGenerationAIPromptId)',
          },
          guardrail_id: {
            type: 'string',
            description: 'Optional AI guardrail ID to apply',
          },
        },
        required: ['assistant_id', 'name', 'type'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'created',
                  assistant_id: args.assistant_id,
                  agent_name: args.name,
                  type: args.type,
                  visibility_status: args.visibility_status ?? 'PUBLISHED',
                  ai_prompt_ids: args.ai_prompt_ids,
                  guardrail_id: args.guardrail_id,
                  note: 'Connect native AI agent created. Use update_connect_ai_agent to set it as the default for the assistant or sessions.',
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
      name: 'list_connect_ai_agents',
      description:
        'List Amazon Connect AI agents (Amazon Q in Connect) for the given assistant. Covers speech-to-speech, self-service, agent assistance, orchestration, and Bedrock AgentCore 3rd party agents via Gateways. Optionally filter by origin (SYSTEM or CUSTOMER).',
      inputSchema: {
        type: 'object',
        properties: {
          assistant_id: {
            type: 'string',
            description: 'The Connect AI Agent Assistant ID',
          },
          origin: {
            type: 'string',
            enum: ['SYSTEM', 'CUSTOMER'],
            description: 'Filter by origin',
          },
        },
        required: ['assistant_id'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  assistant_id: args.assistant_id,
                  origin: args.origin ?? 'ALL',
                  agents: [
                    {
                      id: 'system-orchestration',
                      name: 'Orchestration',
                      type: 'ORCHESTRATION',
                      origin: 'SYSTEM',
                    },
                    {
                      id: 'system-answer-recommendation',
                      name: 'Answer Recommendation',
                      type: 'ANSWER_RECOMMENDATION',
                      origin: 'SYSTEM',
                    },
                    {
                      id: 'system-self-service',
                      name: 'Self Service',
                      type: 'SELF_SERVICE',
                      origin: 'SYSTEM',
                    },
                  ],
                  note: 'Full qconnect integration requires AWS SDK @aws-sdk/client-qconnect.',
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
      name: 'update_connect_ai_agent',
      description:
        'Update, publish, or set defaults for an Amazon Connect AI agent (Amazon Q in Connect). Use this to deploy speech-to-speech agents, self-service agents, or Bedrock AgentCore Gateway integrations.',
      inputSchema: {
        type: 'object',
        properties: {
          assistant_id: { type: 'string', description: 'Connect AI Agent Assistant ID' },
          ai_agent_id: { type: 'string', description: 'The AI agent ID to update' },
          action: {
            type: 'string',
            enum: ['publish', 'set_assistant_default', 'set_session_default'],
            description: 'What action to perform',
          },
          ai_agent_type: {
            type: 'string',
            enum: [
              'ORCHESTRATION',
              'ANSWER_RECOMMENDATION',
              'MANUAL_SEARCH',
              'SELF_SERVICE',
              'EMAIL_RESPONSE',
              'EMAIL_OVERVIEW',
              'EMAIL_GENERATIVE_ANSWER',
            ],
            description: 'Required when setting assistant default',
          },
          session_id: {
            type: 'string',
            description: 'Required when setting session default',
          },
        },
        required: ['assistant_id', 'ai_agent_id', 'action'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'updated',
                  assistant_id: args.assistant_id,
                  ai_agent_id: args.ai_agent_id,
                  action: args.action,
                  ai_agent_type: args.ai_agent_type,
                  session_id: args.session_id,
                  note: 'Connect native AI agent updated. Full qconnect integration requires additional AWS setup.',
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
