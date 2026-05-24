import {
  BedrockAgentClient,
  CreateAgentCommand,
  ListAgentsCommand,
} from '@aws-sdk/client-bedrock-agent';

export class BedrockAgentManager {
  private client: BedrockAgentClient;

  constructor(region: string) {
    this.client = new BedrockAgentClient({ region });
  }

  async listAgents() {
    return this.client.send(new ListAgentsCommand({}));
  }

  async createAgent(
    name: string,
    description: string,
    instruction: string,
    foundationModel = 'anthropic.claude-3-5-sonnet-20241022-v2:0'
  ) {
    return this.client.send(
      new CreateAgentCommand({
        agentName: name,
        description,
        instruction,
        foundationModel,
      })
    );
  }
}
