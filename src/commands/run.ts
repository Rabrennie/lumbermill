import { Args, Flags } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import { spawn } from 'node:child_process';
import * as path from 'node:path';

export default class Run extends BaseWorkTreeCommand {
  static description = 'Runs a script in a worktree';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    branch: Flags.string({
      description: 'branch name to run script in',
      required: true,
    }),
  };

  static args = {
    script: Args.string({ description: 'file to read', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Run);

    const repo = await this.getRepoFolder();
    const folder = this.getSafeFolderName(flags.branch);
    const config = await this.getRepoConfig();

    if (!config.scripts[args.script]) {
      this.error(`Script ${args.script} not found in config`);
    }

    const scriptString = config.scripts[args.script];

    await new Promise((resolve) => {
      // get shell from env
      const shell = process.env.SHELL ?? '/usr/bin/env bash';

      const script = spawn(shell, ['-c', scriptString], {
        cwd: path.join(repo, folder),
        stdio: 'inherit',
      });
      script.on('close', resolve);
      script.on('error', () => {
        this.error('Failed to run script.');
      });
    });
  }
}
