import { Hook, ux } from '@oclif/core';
import * as fs from 'node:fs';
import * as path from 'node:path';

const hook: Hook<'init'> = async function () {
  // check if the user config file exists
  // if not, create it
  const userConfigPath = path.join(this.config.configDir, 'config.json');
  const fileExists = await fs.promises.stat(userConfigPath).catch(() => false);
  if (!fileExists) {
    console.log('here');
    ux.action.start(
      'Creating config file as lumbermill is being run for the first time',
    );

    await fs.promises.mkdir(this.config.configDir, { recursive: true });
    await fs.promises.writeFile(
      userConfigPath,
      JSON.stringify(
        {
          repos: {},
        },
        null,
        2,
      ),
    );
    ux.action.stop();
  }
};

export default hook;
