import { Command } from '@oclif/core';
import { spawn } from 'node:child_process';

export default class BaseCommand extends Command {
  public async run(): Promise<void> {
    // do nothing
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
