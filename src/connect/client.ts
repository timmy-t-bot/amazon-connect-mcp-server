import {
  ConnectClient,
  StartOutboundVoiceContactCommand,
  type StartOutboundVoiceContactCommandOutput,
  ListInstancesCommand,
  ListContactFlowsCommand,
  ListPhoneNumbersCommand,
  ListQueuesCommand,
  DescribeInstanceCommand,
  type ContactFlowSummary,
  type QueueSummary,
  type PhoneNumberSummary,
} from '@aws-sdk/client-connect';
import type { ConnectConfig } from '../config/schema.js';

export class ConnectClientWrapper {
  private client: ConnectClient;
  private config: ConnectConfig;

  constructor(config: ConnectConfig) {
    this.config = config;
    this.client = new ConnectClient({ region: config.region });
  }

  async makeCall(args: {
    phoneNumber: string;
    message: string;
    contactFlowId?: string;
    sourcePhoneNumber?: string;
  }): Promise<StartOutboundVoiceContactCommandOutput> {
    const flowId = args.contactFlowId ?? this.config.contactFlows?.outboundReminder;
    const sourceNumber = args.sourcePhoneNumber ?? this.config.phoneNumbers?.outbound;

    if (!flowId) throw new Error('No contact flow ID provided or configured');
    if (!sourceNumber) throw new Error('No source phone number provided or configured');

    const command = new StartOutboundVoiceContactCommand({
      InstanceId: this.config.instanceId,
      ContactFlowId: flowId,
      DestinationPhoneNumber: args.phoneNumber,
      SourcePhoneNumber: sourceNumber,
      Attributes: {
        ReminderMessage: args.message,
      },
    });

    return this.client.send(command);
  }

  async listInstances() {
    const command = new ListInstancesCommand({});
    const response = await this.client.send(command);
    return response.InstanceSummaryList ?? [];
  }

  async describeInstance(instanceId: string) {
    const command = new DescribeInstanceCommand({ InstanceId: instanceId });
    return this.client.send(command);
  }

  async listContactFlows(instanceId: string): Promise<ContactFlowSummary[]> {
    const command = new ListContactFlowsCommand({ InstanceId: instanceId });
    const response = await this.client.send(command);
    return response.ContactFlowSummaryList ?? [];
  }

  async listQueues(instanceId: string): Promise<QueueSummary[]> {
    const command = new ListQueuesCommand({ InstanceId: instanceId });
    const response = await this.client.send(command);
    return response.QueueSummaryList ?? [];
  }

  async listPhoneNumbers(instanceId: string): Promise<PhoneNumberSummary[]> {
    const command = new ListPhoneNumbersCommand({ InstanceId: instanceId });
    const response = await this.client.send(command);
    return response.PhoneNumberSummaryList ?? [];
  }
}
