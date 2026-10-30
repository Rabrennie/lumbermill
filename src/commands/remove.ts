import { Args, ux } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';
import { pathExists } from '../lib/fs';

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

    const context = await this.getScriptContext(args.branch);

    if (!(await pathExists(context.worktreeDir))) {
      this.error('Worktree does not exist.');
    }

    await this.runHook('pre-remove', context);

    ux.action.start(`Removing worktree ${args.branch}`);
    try {
      await this.runGitCommand(['worktree', 'remove', '--force', context.folder], {
        cwd: context.root,
      });
    } catch {
      ux.action.stop('Failed to remove worktree.');
      this.error('Failed to remove worktree.');
    } finally {
      ux.action.stop();
    }
  }
}
