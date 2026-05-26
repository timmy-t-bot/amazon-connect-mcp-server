import {
  ConnectClient,
  CreateInstanceCommand,
  CreateContactFlowCommand,
  ClaimPhoneNumberCommand,
  ListInstancesCommand,
  ListContactFlowsCommand,
  ListPhoneNumbersCommand,
  DescribeInstanceCommand,
} from '@aws-sdk/client-connect';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface InstanceInfo {
  Id: string;
  InstanceAlias?: string;
  Arn?: string;
}

export class ConnectProvisioner {
  private client: ConnectClient;

  constructor(region: string) {
    this.client = new ConnectClient({ region });
  }

  async findOrCreateInstance(alias: string): Promise<InstanceInfo> {
    const list = await this.client.send(new ListInstancesCommand({}));
    const existing = list.InstanceSummaryList?.find(
      (i) => i.InstanceAlias === alias
    );
    if (existing?.Id) {
      const detail = await this.client.send(
        new DescribeInstanceCommand({ InstanceId: existing.Id })
      );
      return {
        Id: existing.Id,
        InstanceAlias: detail.Instance?.InstanceAlias ?? alias,
        Arn: detail.Instance?.Arn,
      };
    }

    const created = await this.client.send(
      new CreateInstanceCommand({
        IdentityManagementType: 'CONNECT_MANAGED',
        InstanceAlias: alias,
        InboundCallsEnabled: true,
        OutboundCallsEnabled: true,
      })
    );
    return {
      Id: created.Id!,
      InstanceAlias: alias,
      Arn: created.Arn,
    };
  }

  async createOutboundReminderFlow(instanceId: string) {
    const content = readFileSync(
      join(__dirname, '../templates/flows/outbound-reminder.json'),
      'utf-8'
    );
    return this.client.send(
      new CreateContactFlowCommand({
        InstanceId: instanceId,
        Name: 'OutboundReminder',
        Type: 'OUTBOUND_WHISPER',
        Content: content,
      })
    );
  }

  async claimPhoneNumber(instanceId: string, phoneNumber: string) {
    return this.client.send(
      new ClaimPhoneNumberCommand({
        TargetArn: `arn:aws:connect:*:*:instance/${instanceId}`,
        PhoneNumber: phoneNumber,
      })
    );
  }

  async getExistingResources(instanceId: string) {
    const [flows, numbers] = await Promise.all([
      this.client.send(new ListContactFlowsCommand({ InstanceId: instanceId })),
      this.client.send(new ListPhoneNumbersCommand({ InstanceId: instanceId })),
    ]);
    return {
      flows: flows.ContactFlowSummaryList ?? [],
      numbers: numbers.PhoneNumberSummaryList ?? [],
    };
  }
}
