import { Args, Flags, ux } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import { getSafeFolderName } from '../lib/fs';

export default class Create extends BaseWorkTreeCommand {
  static description = 'Creates a new worktree for a lumbermill managed repo';

  static examples = [
    '<%= config.bin %> <%= command.id %> user/ticket-123/testing',
    '<%= config.bin %> <%= command.id %> user/ticket-123/follow-up --from user/ticket-123/testing',
  ];

  static flags = {
    from: Flags.string({
      description: 'branch to base the new branch on, if not specified, will use the default branch after pulling it',
    }),
  };

  static args = {
    branch: Args.string({
      description: 'branch name to create',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Create);

    const repo = await this.getRepoFolder();
    const config = await this.getRepoConfig();
    const defaultBranch = config.defaultBranch ?? 'main';
    const folder = getSafeFolderName(args.branch);

    if (flags.from) {
      await this.assertBranchExists(repo, flags.from);
    } else {
      await this.updateDefaultBranch(repo, defaultBranch);
    }

    await this.createWorktree(repo, args.branch, folder, flags.from);

    this.log(`Created worktree for ${args.branch} in ${repo}/${folder}`);

    await this.runHook('post-create', await this.getScriptContext(args.branch));
  }

  private assertBranchExists = async (repo: string, branch: string): Promise<void> => {
    try {
      await this.runGitCommand(['rev-parse', '--verify', '--quiet', `${branch}^{commit}`], { cwd: repo });
    } catch {
      this.error(`Branch ${branch} does not exist.`);
    }
  };

  private createWorktree = async (
    repo: string,
    branch: string,
    folder: string,
    from?: string,
  ): Promise<void> => {
    ux.action.start('Creating worktree');
    try {
      const output = await this.runGitCommand(
        ['worktree', 'add', '--no-track', '-b', branch, folder, ...(from ? [from] : [])],
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
