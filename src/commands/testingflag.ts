import { Args, Flags } from '@oclif/core';
import BaseWorkTreeCommand from '../base-worktree-command';

export default class Testingflag extends BaseWorkTreeCommand {
  static description = 'describe the command here';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
  };

  static args = {
    file: Args.string({ description: 'file to read' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Testingflag);

    const repo = await this.getRepoFolder();
    console.log('here');

    console.log(repo);
  }
}
