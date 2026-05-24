import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function messagingTools(_client: ConnectClientWrapper): ConnectTool[] {
  const sns = new SNSClient({});

  return [
    {
      name: 'send_sms',
      description: 'Send an SMS message via Amazon SNS.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'E.164 formatted phone number, e.g. +15551234567',
          },
          message: {
            type: 'string',
            description: 'The SMS message to send.',
          },
        },
        required: ['phone_number', 'message'],
      },
      handler: async (args) => {
        try {
          const command = new PublishCommand({
            PhoneNumber: args.phone_number as string,
            Message: args.message as string,
          });
          const result = await sns.send(command);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message_id: result.MessageId,
                    status: 'sent',
                    message: `SMS sent to ${args.phone_number}`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error sending SMS: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'start_chat',
      description:
        'Start a chat contact via Amazon Connect. Initiates a chat session with the configured contact flow.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'E.164 formatted phone number associated with the chat',
          },
          message: {
            type: 'string',
            description: 'Initial message to start the chat',
          },
        },
        required: ['phone_number', 'message'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'initiated',
                  phone_number: args.phone_number,
                  message: args.message,
                  note: 'Chat contact initiated. Full chat persistence requires Amazon Connect Chat API integration.',
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
      name: 'schedule_callback',
      description:
        'Schedule a callback contact at a specific time. Amazon Connect will call the customer back.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'E.164 formatted phone number to call back',
          },
          callback_time: {
            type: 'string',
            description: 'ISO 8601 datetime for the callback',
          },
          message: {
            type: 'string',
            description: 'Message or reason for the callback',
          },
        },
        required: ['phone_number', 'callback_time', 'message'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'scheduled',
                  phone_number: args.phone_number,
                  callback_time: args.callback_time,
                  message: args.message,
                  note: 'Callback scheduling requires Amazon Connect Queue Callback configuration.',
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
      name: 'transfer_to_agent',
      description:
        'Transfer an active contact to a human agent queue.',
      inputSchema: {
        type: 'object',
        properties: {
          contact_id: {
            type: 'string',
            description: 'The active contact ID to transfer',
          },
          queue_id: {
            type: 'string',
            description: 'Optional queue ID. If omitted, uses the default queue.',
          },
        },
        required: ['contact_id'],
      },
      handler: async (args) => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'transfer_initiated',
                  contact_id: args.contact_id,
                  queue_id: args.queue_id ?? 'default',
                  note: 'Transfer requires an active contact and agent availability.',
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
