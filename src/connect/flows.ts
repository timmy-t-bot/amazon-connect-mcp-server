import { ConnectClient, CreateContactFlowCommand } from '@aws-sdk/client-connect';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class FlowManager {
  private client: ConnectClient;

  constructor(region: string) {
    this.client = new ConnectClient({ region });
  }

  async deployTemplate(
    instanceId: string,
    templateName: string,
    flowName: string
  ) {
    const content = readFileSync(
      join(__dirname, `../templates/flows/${templateName}.json`),
      'utf-8'
    );
    return this.client.send(
      new CreateContactFlowCommand({
        InstanceId: instanceId,
        Name: flowName,
        Type: 'OUTBOUND_WHISPER',
        Content: content,
      })
    );
  }
}
