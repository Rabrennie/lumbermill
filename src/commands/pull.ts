import { Args, ux } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import { getSafeFolderName } from '../lib/fs';

export default class Pull extends BaseWorkTreeCommand {
  static description = 'Pulls a remote branch into a worktree';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    branch: Args.string({
      description: 'branch name to pull',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Pull);

    const repo = await this.getRepoFolder();
    const config = await this.getRepoConfig();
    const defaultBranch = config.defaultBranch ?? 'main';
    const folder = getSafeFolderName(args.branch);

    await this.updateDefaultBranch(repo, defaultBranch);
    await this.pullBranch(repo, args.branch, folder);
  }

  private pullBranch = async (
    repo: string,
    branch: string,
    folder: string,
  ): Promise<void> => {
    ux.action.start('Pulling branch');
    try {
      const output = await this.runGitCommand(
        ['worktree', 'add', folder, branch],
        { cwd: repo },
      );
      if (output.includes('fatal')) {
        throw new Error(output);
      }
    } catch (error: any) {
      ux.action.stop('something went wrong');
      this.error(error.toString());
    } finally {
      ux.action.stop();
    }
  };
}
