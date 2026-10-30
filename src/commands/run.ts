import { Args, Flags } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import * as path from 'node:path';
import { getSafeFolderName, pathExists } from '../lib/fs';
import { runScript } from '../lib/scripts';

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

    const scriptsFolder = await this.getScriptsFolder();
    const folder = getSafeFolderName(flags.branch);
    const repo = await this.getRepoFolder();
    const config = await this.getRepoConfig();

    const scriptPath = path.join(scriptsFolder, args.script);

    if (!await pathExists(scriptPath)) {
      this.error('Script does not exist.');
    }

    const worktreeDir = path.join(repo, folder);

    if (!await pathExists(worktreeDir)) {
      this.error('Worktree does not exist.');
    }

    let code: number;
    try {
      code = await runScript(scriptPath, {
        root: repo,
        mainDir: path.join(repo, config.defaultBranch ?? 'main'),
        worktreeDir,
        branch: flags.branch,
        folder,
      });
    } catch {
      this.error('Failed to run script.');
    }

    if (code !== 0) {
      this.exit(code);
    }
  }
}
