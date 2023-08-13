import { Args } from '@oclif/core';
import BaseCommand from '../../base-command';
import { getUserConfig, updateUserConfig } from '../../lib/config';

export default class AliasSet extends BaseCommand {
  static description = 'describe the command here';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    alias: Args.string({ description: 'alias to set', required: true }),
    expansion: Args.string({ description: 'expansion to set', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(AliasSet);

    if (this.config.findMatches(args.alias, []).length > 0) {
      this.error(`${args.alias} is already a command`);
    }

    const userConfig = await getUserConfig(this.config.configDir);
    if (!userConfig.aliases) {
      userConfig.aliases = {};
    } else if (userConfig.aliases[args.alias]) {
      this.error(`${args.alias} is already an alias`);
    }

    userConfig.aliases[args.alias] = args.expansion;
    updateUserConfig(this.config.configDir, userConfig);
  }
}
