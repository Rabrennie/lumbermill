import { Args, ux } from '@oclif/core';
import { spawn } from 'node:child_process';
import BaseWorkTreeCommand from '../base-worktree-command';

export default class Remove extends BaseWorkTreeCommand {
  static description = 'Removes a worktree from a lumbermill managed repo';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static aliases = ['rm'];

  static args = {
    branch: Args.string({
      description: 'branch name to remove',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Remove);

    const repo = await this.getRepoFolder();

    const folder = this.getSafeFolderName(args.branch);

    ux.action.start(`Removing worktree ${args.branch}`);
    await new Promise((resolve) => {
      const rm = spawn('rm', ['-rf', `${repo}/${folder}`]);
      rm.on('close', resolve);
      rm.on('error', () => {
        ux.action.stop('Failed to remove worktree.');
        this.error('Failed to remove worktree.');
      });
    });

    try {
      await this.runGitCommand(['worktree', 'prune'], {
        cwd: repo,
      });
    } catch {
      ux.action.stop('Failed to remove worktree.');
      this.error('Failed to remove worktree.');
    } finally {
      ux.action.stop();
    }
  }
}
