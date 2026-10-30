import { Hook } from '@oclif/core';
import { run } from '@oclif/core';
import { getUserConfig } from '../../lib/config';

const hook: Hook<'command_not_found'> = async function (opts) {
  // oclif joins every argument before the first flag into the id, e.g. `lm mk feat/x` arrives as `mk:feat/x`
  const [alias, ...args] = opts.id.split(':');

  const userConfig = await getUserConfig(this.config.configDir);
  const command = userConfig.aliases[alias];
  if (!command) {
    this.error(`Alias ${alias} not found.`);
  }

  return run([...command.split(' '), ...args, ...(opts.argv ?? [])], this.config);
};

export default hook;
