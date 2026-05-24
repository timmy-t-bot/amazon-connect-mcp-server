import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { ServerConfigSchema, type ServerConfig } from './schema.js';

const CONFIG_DIR = join(homedir(), '.amazon-connect-mcp');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export async function loadConfig(): Promise<ServerConfig | null> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return ServerConfigSchema.parse(parsed);
  } catch {
    return null;
  }
}

export async function saveConfig(config: ServerConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
