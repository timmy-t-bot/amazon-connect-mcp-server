import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function instanceTools(client: ConnectClientWrapper): ConnectTool[] {
  return [
    {
      name: 'get_instance_status',
      description: 'Get the status and details of the Amazon Connect instance.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const instances = await client.listInstances();
          if (instances.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'No Connect instances found.',
                },
              ],
            };
          }
          const details = await client.describeInstance(instances[0].Id!);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(details.Instance, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error getting instance status: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'list_phone_numbers',
      description: 'List all claimed phone numbers in the Connect instance.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const instances = await client.listInstances();
          const numbers = await client.listPhoneNumbers(
            instances[0]?.Id ?? ''
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(numbers, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error listing phone numbers: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'get_metrics',
      description:
        'Get real-time metrics for the Amazon Connect instance (queues, agents).',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const instances = await client.listInstances();
          const instanceId = instances[0]?.Id ?? '';
          const queues = await client.listQueues(instanceId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    instance_id: instanceId,
                    queues: queues.map((q) => ({
                      id: q.Id,
                      name: q.Name,
                      arn: q.Arn,
                    })),
                    note: 'Real-time agent metrics require GetCurrentMetricData API calls.',
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
                text: `Error getting metrics: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
  ];
}
