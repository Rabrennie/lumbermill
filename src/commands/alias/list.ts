import { Command } from '@oclif/core';
import { getUserConfig } from '../../lib/config';

export default class AliasList extends Command {
  static description = 'lists all defined aliases';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    await this.parse(AliasList);

    const userConfig = await getUserConfig(this.config.configDir);
    const aliases = userConfig.aliases ?? {};

    const entries = Object.entries(aliases);
    if (entries.length === 0) {
      this.log('No aliases defined.');
      return;
    }

    const width = Math.max(...entries.map(([alias]) => alias.length));
    for (const [alias, expansion] of entries) {
      this.log(`${alias.padEnd(width)}  ${expansion}`);
    }
  }
}
