import { ConnectClientWrapper } from '../../src/connect/client.js';
import type { ConnectConfig } from '../../src/config/schema.js';

const mockConfig: ConnectConfig = {
  instanceId: 'test-instance-id',
  region: 'us-east-1',
};

describe('ConnectClientWrapper', () => {
  let client: ConnectClientWrapper;

  beforeEach(() => {
    client = new ConnectClientWrapper(mockConfig);
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });
});
