import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function messagingTools(client: ConnectClientWrapper): ConnectTool[] {
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
  ];
}
