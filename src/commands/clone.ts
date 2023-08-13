import { Args, ux } from '@oclif/core';
import * as fs from 'node:fs';
import * as path from 'node:path';
import BaseCommand from '../base-command';
import { normalizePath, pathExists } from '../lib/fs';

export default class Clone extends BaseCommand {
  static description = 'Clones a repo and configures it for lumbermill';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    repo: Args.string({ description: 'repo to clone', required: true }),
    directory: Args.string({
      description: 'target directory',
      required: false,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Clone);

    ux.action.start('Cloning repo');

    const userConfig = await this.getUserConfig();

    // check if the target directory exists and throw an error if it does
    const folderName = args.repo.split('/').pop()?.replace('.git', '');
    if (!folderName) {
      this.error('Invalid repo name.');
    }

    const repoName = args.directory ?? folderName;
    const targetDir = normalizePath(path.join(process.cwd(), repoName));

    if (
      userConfig.repos[repoName] ||
      Object.values(userConfig.repos).includes(targetDir)
    ) {
      this.error('Repo already exists in config.');
    }

    if (await pathExists(targetDir)) {
      this.error('Target directory already exists.');
    }

    const dotLumbermillDir = path.join(targetDir, '.lumbermill');
    await fs.promises.mkdir(dotLumbermillDir, { recursive: true });
    await fs.promises.writeFile(
      path.join(dotLumbermillDir, 'config.json'),
      JSON.stringify(
        {
          repo: args.repo,
          directory: targetDir,
          defaultBranch: 'main',
          scripts: {},
        },
        null,
        2,
      ),
    );

    let branchName = '';
    try {
      const output = await this.runGitCommand([
        'ls-remote',
        '--symref',
        args.repo,
        'HEAD',
      ]);
      branchName = output.split('refs/heads/')[1].split(/\s/)[0];
    } catch (error: any) {
      this.error(error.toString());
    }

    try {
      const output = await this.runGitCommand(
        ['clone', args.repo, branchName],
        {
          cwd: targetDir,
        },
      );
      this.log(output);
    } catch (error: any) {
      this.error(error.toString());
    }

    await fs.promises.writeFile(
      path.join(targetDir, '.git'),
      'gitdir: ./main/.git',
    );

    userConfig.repos[repoName] = targetDir;
    await this.updateUserConfig(userConfig);

    ux.action.stop();
    ux.info(`Cloned ${args.repo} to ${targetDir}`);
  }
}
