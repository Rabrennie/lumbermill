import { Command } from '@oclif/core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';

export default class BaseCommand extends Command {
  public async run(): Promise<void> {
    // do nothing
  }

  protected async getUserConfig(): Promise<any> {
    try {
      const userConfig = await fs.promises.readFile(
        path.join(this.config.configDir, 'config.json'),
      );
      return JSON.parse(userConfig.toString());
    } catch {
      this.error('Invalid user config file.');
    }
  }

  protected async updateUserConfig(config: any): Promise<void> {
    try {
      await fs.promises.writeFile(
        path.join(this.config.configDir, 'config.json'),
        JSON.stringify(config, null, 2),
      );
    } catch {
      this.error('Invalid user config file.');
    }
  }

  protected async runGitCommand(
    args: string[],
    options: { cwd?: string } = {},
  ): Promise<string> {
    let output = '';
    return new Promise((resolve, reject) => {
      const child = spawn('git', args, {
        cwd: options.cwd ?? process.cwd(),
      });

      child.stdout.on('data', (data: any) => {
        output += data.toString();
      });

      child.stderr.on('data', (data: any) => {
        output += data.toString();
      });

      child.on('close', (code: any) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(output);
        }
      });

      child.on('error', (error: any) => {
        output += error.toString();
        reject(output);
      });
    });
  }
}
