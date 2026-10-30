import { Args, ux } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import { getSafeFolderName } from '../lib/fs';

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
    const folder = getSafeFolderName(args.branch);

    await this.updateDefaultBranch(repo, defaultBranch);
    await this.createWorktree(repo, args.branch, folder);

    this.log(`Created worktree for ${args.branch} in ${repo}/${folder}`);

    await this.runHook('post-create', await this.getScriptContext(args.branch));
  }

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
