import { Args, Command, ux } from '@oclif/core';
import { getUserConfig, updateUserConfig } from '../../lib/config';

export default class AliasDelete extends Command {
  static description = 'describe the command here';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    alias: Args.string({ description: 'alias to delete', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(AliasDelete);

    ux.action.start(`Deleting alias ${args.alias}`);

    const userConfig = await getUserConfig(this.config.configDir);
    if (!userConfig.aliases || !userConfig.aliases[args.alias]) {
      ux.action.stop('Alias not found');
      this.error(`${args.alias} is not an alias`);
    }

    delete userConfig.aliases[args.alias];
    updateUserConfig(this.config.configDir, userConfig);

    ux.action.stop();
  }
}
