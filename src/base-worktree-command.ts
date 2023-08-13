import { Flags } from '@oclif/core';
import BaseCommand from './base-command';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { normalizePath, pathExists } from './lib/fs';

interface RepoConfig {
  repo: string;
  directory: string;
  defaultBranch: string;
  scripts: Record<string, string>;
}

export default class BaseWorkTreeCommand extends BaseCommand {
  static baseFlags = {
    repo: Flags.string({
      description: 'repo to use',
    }),
  };

  protected async getRepoFolder(): Promise<string> {
    const { flags } = await this.parse(
      this.constructor as typeof BaseWorkTreeCommand,
    );

    let repo = flags.repo;
    const userConfig = await this.getUserConfig();

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

  protected async getRepoConfig(): Promise<RepoConfig> {
    const repo = await this.getRepoFolder();
    const repoConfig = await fs.promises.readFile(
      `${repo}/.lumbermill/config.json`,
    );

    return JSON.parse(repoConfig.toString());
  }

  protected getSafeFolderName(name: string): string {
    return name.replace(/[^\w.-]/g, '-');
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

    if (!await pathExists(lumbermillRoot)) {
      this.error('Something has gone wrong. Lumbermill root does not exist.');
    }

    return normalizePath(lumbermillRoot);
  }
}
