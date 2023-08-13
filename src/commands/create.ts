import { Args, ux } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import * as path from 'node:path';

export default class Create extends BaseWorkTreeCommand {
  static description = 'Creates a new worktree for a lumbermill managed repo';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    branch: Args.string({
      description: 'branch name to create',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Create);

    const repo = await this.getRepoFolder();
    const config = await this.getRepoConfig();
    const defaultBranch = config.defaultBranch ?? 'main';
    const folder = this.getSafeFolderName(args.branch);

    this.updateDefaultBranch(repo, defaultBranch);
    this.createWorktree(repo, args.branch, folder);

    this.log(`Created worktree for ${args.branch} in ${repo}/${folder}`);
  }

  private updateDefaultBranch = async (
    repo: string,
    defaultBranch: string,
  ): Promise<void> => {
    ux.action.start(`Updating ${defaultBranch} from remote`);
    try {
      const output = await this.runGitCommand(['pull'], {
        cwd: path.join(repo, defaultBranch),
      });
      if (output.includes('fatal')) {
        throw new Error(output);
      }
    } catch {
      ux.action.stop('Failed to pull from remote.');
      this.error('Failed to pull from remote.');
    } finally {
      ux.action.stop();
    }
  };

  private createWorktree = async (
    repo: string,
    branch: string,
    folder: string,
  ): Promise<void> => {
    ux.action.start('Creating worktree');
    try {
      const output = await this.runGitCommand(
        ['worktree', 'add', '--no-track', '-b', branch, folder],
        { cwd: repo },
      );
      if (output.includes('already exists')) {
        throw new Error(output);
      }
    } catch {
      ux.action.stop('Branch already exists.');
      this.error('Failed to create worktree: Branch already exists.');
    } finally {
      ux.action.stop();
    }
  };
}
