import { callTools } from '../../src/tools/calls.js';
import { ConnectClientWrapper } from '../../src/connect/client.js';
import type { ConnectConfig } from '../../src/config/schema.js';

const mockConfig: ConnectConfig = {
  instanceId: 'test-instance-id',
  region: 'us-east-1',
  contactFlows: { outboundReminder: 'test-flow-id' },
  phoneNumbers: { outbound: '+15551234567' },
};

describe('callTools', () => {
  const client = new ConnectClientWrapper(mockConfig);
  const tools = callTools(client);

  it('should export make_call tool', () => {
    const tool = tools.find((t) => t.name === 'make_call');
    expect(tool).toBeDefined();
    expect(tool?.description).toContain('outbound voice call');
  });

  it('should export list_contact_flows tool', () => {
    const tool = tools.find((t) => t.name === 'list_contact_flows');
    expect(tool).toBeDefined();
  });
});
