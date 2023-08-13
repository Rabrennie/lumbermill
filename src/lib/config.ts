import * as fs from 'node:fs';
import * as path from 'node:path';

export interface UserConfig {
  repos: Record<string, string>;
  aliases: Record<string, string>;
}

export async function getUserConfig(configDir: string): Promise<UserConfig> {
  try {
    const userConfig = await fs.promises.readFile(
      path.join(configDir, 'config.json'),
    );
    return JSON.parse(userConfig.toString());
  } catch {
    throw new Error('Invalid user config file.');
  }
}

export async function updateUserConfig(
  configDir: string,
  config: UserConfig,
): Promise<void> {
  try {
    await fs.promises.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify(config, null, 2),
    );
  } catch {
    throw new Error('Invalid user config file.');
  }
}
