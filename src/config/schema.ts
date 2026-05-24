import { z } from 'zod';

export const ConnectConfigSchema = z.object({
  instanceId: z.string().min(1),
  instanceArn: z.string().optional(),
  region: z.string().default('us-east-1'),
  profile: z.string().optional(),
  contactFlows: z.record(z.string()).optional(),
  phoneNumbers: z.record(z.string()).optional(),
  queues: z.record(z.string()).optional(),
});

export const ServerConfigSchema = z.object({
  version: z.literal('1').default('1'),
  aws: ConnectConfigSchema,
  transport: z.enum(['stdio', 'sse']).default('stdio'),
  ssePort: z.number().int().min(1).max(65535).default(3000),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type ConnectConfig = z.infer<typeof ConnectConfigSchema>;
