import { Flags, ux } from '@oclif/core';
import BaseCommand from './base-command';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { normalizePath, pathExists } from './lib/fs';
import { getUserConfig } from './lib/config';

interface RepoConfig {
  repo: string;
  directory: string;
  defaultBranch: string;
}

export default class BaseWorkTreeCommand extends BaseCommand {
  static baseFlags = {
    repo: Flags.string({
      description:
        'repo to use, if not specified, will use repo associated with the current directory',
    }),
  };

  protected async getRepoFolder(): Promise<string> {
    const { flags } = await this.parse(
      this.constructor as typeof BaseWorkTreeCommand,
    );

    let repo = flags.repo;
    const userConfig = await getUserConfig(this.config.configDir);

    if (!flags.repo) {
      const repoFolder = await this.getRootGitFolder();
      repo = Object.entries(userConfig.repos).find(([_, value]) => {
        return value === repoFolder;
      })?.[0];
    }

    if (!repo) {
      this.error('No repo specified.');
    }

    if (!userConfig.repos[repo]) {
      this.error('Repo does not exist in config.');
    }

    return userConfig.repos[repo];
  }

  protected async getScriptsFolder(): Promise<string> {
    const repo = await this.getRepoFolder();
    return path.join(repo, '.lumbermill', 'scripts');
  }

  protected async getRepoConfig(): Promise<RepoConfig> {
    const repo = await this.getRepoFolder();
    const repoConfig = await fs.promises.readFile(
      `${repo}/.lumbermill/config.json`,
    );

    return JSON.parse(repoConfig.toString());
  }

  protected async getRootGitFolder(): Promise<string> {
    // check if we are in a git repo
    let gitCommonDir;
    try {
      gitCommonDir = await this.runGitCommand([
        'rev-parse',
        '--git-common-dir',
        '--path-format=absolute',
      ]);
    } catch {
      this.error('Not in a git repo.');
    }

    const gitRoot = gitCommonDir.split('\n')[0].trim();

    const lumbermillRoot = path.normalize(path.join(gitRoot, '../../'));

    if (!(await pathExists(lumbermillRoot))) {
      this.error('Something has gone wrong. Lumbermill root does not exist.');
    }

    return normalizePath(lumbermillRoot);
  }

  protected updateDefaultBranch = async (
    repo: string,
    defaultBranch: string,
  ): Promise<void> => {
    ux.action.start(`Updating ${defaultBranch} from remote`);
    try {
      const output = await this.runGitCommand(['pull'], {
        cwd: path.join(repo, defaultBranch),
      });
      if (output.includes('fatal')) {
        throw new Error(output);
      }
    } catch {
      ux.action.stop('Failed to pull from remote.');
      this.error('Failed to pull from remote.');
    } finally {
      ux.action.stop();
    }
  };
}
