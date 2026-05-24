import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type { ConnectClientWrapper } from '../connect/client.js';
import type { ConnectTool } from './index.js';

export function appointmentTools(client: ConnectClientWrapper): ConnectTool[] {
  const ddb = new DynamoDBClient({});
  const TABLE_NAME = process.env.APPOINTMENTS_TABLE ?? 'amazon-connect-mcp-appointments';

  return [
    {
      name: 'schedule_reminder',
      description:
        'Schedule an outbound reminder call or SMS for a future date/time.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: { type: 'string', description: 'E.164 phone number' },
          message: { type: 'string', description: 'Reminder message' },
          scheduled_time: {
            type: 'string',
            description: 'ISO 8601 datetime when the reminder should be sent',
          },
          channel: {
            type: 'string',
            enum: ['voice', 'sms'],
            description: 'Channel to use for the reminder',
          },
        },
        required: ['phone_number', 'message', 'scheduled_time', 'channel'],
      },
      handler: async (args) => {
        try {
          const item = {
            id: `reminder-${Date.now()}`,
            phoneNumber: args.phone_number,
            message: args.message,
            scheduledTime: args.scheduled_time,
            channel: args.channel,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          };
          await ddb.send(
            new PutItemCommand({
              TableName: TABLE_NAME,
              Item: marshall(item),
            })
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    reminder_id: item.id,
                    status: 'scheduled',
                    scheduled_time: item.scheduledTime,
                    channel: item.channel,
                    message: `Reminder scheduled for ${args.scheduled_time}`,
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
                text: `Error scheduling reminder: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'book_appointment',
      description:
        'Book an appointment and optionally trigger an outbound confirmation call.',
      inputSchema: {
        type: 'object',
        properties: {
          phone_number: { type: 'string', description: 'E.164 phone number' },
          name: { type: 'string', description: 'Customer name' },
          appointment_date: {
            type: 'string',
            description: 'ISO 8601 date/time for the appointment',
          },
          service: { type: 'string', description: 'Service type' },
          send_confirmation: {
            type: 'boolean',
            description: 'Whether to send a confirmation call immediately',
          },
        },
        required: ['phone_number', 'name', 'appointment_date', 'service'],
      },
      handler: async (args) => {
        try {
          const id = `appt-${Date.now()}`;
          const item = {
            id,
            phoneNumber: args.phone_number,
            name: args.name,
            appointmentDate: args.appointment_date,
            service: args.service,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          };
          await ddb.send(
            new PutItemCommand({
              TableName: TABLE_NAME,
              Item: marshall(item),
            })
          );

          if (args.send_confirmation) {
            await client.makeCall({
              phoneNumber: args.phone_number as string,
              message: `Hi ${args.name}, this confirms your ${args.service} appointment on ${args.appointment_date}. See you then!`,
            });
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    appointment_id: id,
                    status: 'confirmed',
                    customer: args.name,
                    phone: args.phone_number,
                    date: args.appointment_date,
                    service: args.service,
                    confirmation_sent: args.send_confirmation ?? false,
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
                text: `Error booking appointment: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'confirm_appointment',
      description: 'Call to confirm an existing appointment.',
      inputSchema: {
        type: 'object',
        properties: {
          appointment_id: { type: 'string', description: 'The appointment ID' },
          phone_number: { type: 'string', description: 'Customer phone number' },
          name: { type: 'string', description: 'Customer name' },
          appointment_date: { type: 'string', description: 'Appointment date/time' },
        },
        required: ['appointment_id', 'phone_number', 'name', 'appointment_date'],
      },
      handler: async (args) => {
        try {
          await client.makeCall({
            phoneNumber: args.phone_number as string,
            message: `Hi ${args.name}, calling to confirm your appointment on ${args.appointment_date}. Press 1 to confirm, or 2 to reschedule.`,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    appointment_id: args.appointment_id,
                    status: 'confirmation_call_initiated',
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
                text: `Error confirming appointment: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
    {
      name: 'cancel_appointment',
      description: 'Call to cancel or reschedule an appointment.',
      inputSchema: {
        type: 'object',
        properties: {
          appointment_id: { type: 'string', description: 'The appointment ID' },
          phone_number: { type: 'string', description: 'Customer phone number' },
          reason: { type: 'string', description: 'Reason for cancellation' },
        },
        required: ['appointment_id', 'phone_number'],
      },
      handler: async (args) => {
        try {
          await client.makeCall({
            phoneNumber: args.phone_number as string,
            message: `We are calling about your appointment. ${args.reason ? `Reason: ${args.reason}.` : ''} It has been cancelled. Please call back to reschedule.`,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    appointment_id: args.appointment_id,
                    status: 'cancelled',
                    cancellation_call_initiated: true,
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
                text: `Error cancelling appointment: ${(err as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      },
    },
  ];
}
