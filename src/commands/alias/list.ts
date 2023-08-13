import { Command, ux } from '@oclif/core';
import { getUserConfig } from '../../lib/config';

export default class AliasList extends Command {
  static description = 'lists all defined aliases';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    const userConfig = await getUserConfig(this.config.configDir);
    const aliases = userConfig.aliases ?? {};

    ux.table(
      Object.entries(aliases).map(([alias, expansion]) => ({
        alias,
        expansion,
      })),
      {
        alias: {
          minWidth: 10,
        },
        expansion: {
          minWidth: 10,
        },
      },
    );
  }
}
