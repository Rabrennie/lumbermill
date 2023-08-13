import { Hook } from '@oclif/core';
import { run } from '@oclif/core';
import { getUserConfig } from '../../lib/config';

const hook: Hook<'command_not_found'> = async function (opts) {
  this.log(`Running alias ${opts.id}`);

  const userConfig = await getUserConfig(this.config.configDir);
  const command = userConfig.aliases[opts.id];
  if (!command) {
    this.error(`Alias ${opts.id} not found.`);
  }

  return run([...command.split(' '), ...(opts.argv ?? [])]);
};

export default hook;
