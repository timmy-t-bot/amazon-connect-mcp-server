import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function callTools(client: ConnectClientWrapper): ConnectTool[] {
  return [
    {
      name: 'make_call',
      description:
        'Place an outbound voice call via Amazon Connect. The call will use text-to-speech to speak the provided message.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'E.164 formatted phone number, e.g. +15551234567',
          },
          message: {
            type: 'string',
            description: 'The message to speak to the recipient.',
          },
          contact_flow_id: {
            type: 'string',
            description: 'Optional contact flow ID override.',
          },
          source_phone_number: {
            type: 'string',
            description: 'Optional source phone number override.',
          },
        },
        required: ['phone_number', 'message'],
      },
      handler: async (args) => {
        try {
          const result = await client.makeCall({
            phoneNumber: args.phone_number as string,
            message: args.message as string,
            contactFlowId: args.contact_flow_id as string | undefined,
            sourcePhoneNumber: args.source_phone_number as string | undefined,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    contact_id: result.ContactId,
                    status: 'dialing',
                    message: `Call initiated to ${args.phone_number}`,
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
                text: `Error placing call: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'list_contact_flows',
      description: 'List all contact flows in the Amazon Connect instance.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const flows = await client.listContactFlows(
            (await client.listInstances())[0]?.Id ?? ''
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(flows, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error listing flows: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
  ];
}
