import { Flags, ux } from '@oclif/core';
import BaseCommand from './base-command';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getSafeFolderName, normalizePath, pathExists } from './lib/fs';
import { getUserConfig } from './lib/config';
import { runScript, ScriptContext } from './lib/scripts';
import { FzfNotFoundError, pickWithFzf } from './lib/fzf';

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
      repo = Object.entries(userConfig.repos).find(([, value]) => {
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

  protected async getScriptContext(
    branch: string,
    folder = getSafeFolderName(branch),
  ): Promise<ScriptContext> {
    const repo = await this.getRepoFolder();
    const config = await this.getRepoConfig();

    return {
      root: repo,
      mainDir: path.join(repo, config.defaultBranch ?? 'main'),
      worktreeDir: path.join(repo, folder),
      branch,
      folder,
    };
  }

  protected async getCurrentWorktreeContext(): Promise<ScriptContext | undefined> {
    const repo = await this.getRepoFolder();

    let toplevel;
    try {
      toplevel = (await this.runGitCommand(['rev-parse', '--show-toplevel'])).trim();
    } catch {
      return undefined;
    }

    const [repoPath, worktreeParent] = await Promise.all([
      fs.promises.realpath(repo),
      fs.promises.realpath(path.dirname(toplevel)),
    ]);

    if (worktreeParent !== repoPath) {
      return undefined;
    }

    const folder = path.basename(toplevel);
    const branch = (await this.runGitCommand(['branch', '--show-current'])).trim();

    return this.getScriptContext(branch || folder, folder);
  }

  protected async pickWorktreeContext(): Promise<ScriptContext> {
    if (!process.stdin.isTTY) {
      this.error('Not inside a worktree. Pass --branch or run from a worktree.');
    }

    const worktrees = await this.listWorktrees();

    let picked;
    try {
      picked = await pickWithFzf(
        worktrees.map(({ folder, branch }) => `${folder}\t${branch}`),
        'worktree: ',
      );
    } catch (error) {
      if (error instanceof FzfNotFoundError) {
        this.error('Not inside a worktree. Pass --branch or run from a worktree.');
      }

      throw error;
    }

    if (!picked) {
      this.exit(130);
    }

    const [folder, branch] = picked.split('\t');
    return this.getScriptContext(branch || folder, folder);
  }

  private async listWorktrees(): Promise<{ folder: string; branch: string }[]> {
    const repo = await this.getRepoFolder();
    const repoPath = await fs.promises.realpath(repo);
    const output = await this.runGitCommand(['worktree', 'list', '--porcelain'], { cwd: repo });

    const worktrees = [];
    for (const block of output.trim().split('\n\n')) {
      const lines = block.split('\n');
      const worktreePath = lines.find((line) => line.startsWith('worktree '))?.slice('worktree '.length);
      const branch = lines.find((line) => line.startsWith('branch '))?.slice('branch refs/heads/'.length) ?? '';

      if (!worktreePath || !(await pathExists(worktreePath))) {
        continue;
      }

      if ((await fs.promises.realpath(path.dirname(worktreePath))) === repoPath) {
        worktrees.push({ folder: path.basename(worktreePath), branch });
      }
    }

    return worktrees;
  }

  protected async runHook(hook: string, context: ScriptContext): Promise<void> {
    const hookPath = path.join(await this.getScriptsFolder(), 'hooks', hook);

    if (!(await pathExists(hookPath))) {
      return;
    }

    let code: number;
    try {
      code = await runScript(hookPath, context);
    } catch {
      this.error(`Failed to run ${hook} hook.`);
    }

    if (code !== 0) {
      this.error(`${hook} hook failed with exit code ${code}.`, { exit: code });
    }
  }

  protected async getRootGitFolder(): Promise<string> {
    // check if we are in a git repo
    let gitCommonDir;
    try {
      gitCommonDir = await this.runGitCommand([
        'rev-parse',
        '--path-format=absolute',
        '--git-common-dir',
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
