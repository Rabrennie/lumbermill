import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, git, type Sandbox } from '../helpers';

describe('clone', () => {
  let sandbox: Sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    destroySandbox(sandbox);
  });

  it('clones the default branch and registers the repo', async () => {
    const project = await cloneProject(sandbox);

    expect(git(path.join(project, 'main'), 'branch', '--show-current').trim()).toBe('main');
    expect(fs.existsSync(path.join(project, '.lumbermill', 'scripts'))).toBe(true);

    const repoConfig = JSON.parse(fs.readFileSync(path.join(project, '.lumbermill', 'config.json'), 'utf8'));
    expect(repoConfig).toMatchObject({ repo: sandbox.remote, directory: project, defaultBranch: 'main' });

    const userConfig = JSON.parse(fs.readFileSync(path.join(sandbox.configDir, 'config.json'), 'utf8'));
    expect(userConfig.repos).toEqual({ project });
  });

  it('refuses to clone into a repo name that is already registered', async () => {
    await cloneProject(sandbox);

    await expect(cloneProject(sandbox)).rejects.toThrow('Repo already exists in config.');
  });
});
