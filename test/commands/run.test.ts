import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, lm, type Sandbox } from '../helpers';

describe('run', () => {
  let sandbox: Sandbox;
  let project: string;
  let worktree: string;

  const writeScript = (name: string, contents: string, mode = 0o644) => {
    fs.writeFileSync(path.join(project, '.lumbermill', 'scripts', name), contents, { mode });
  };

  const readOutput = () => fs.readFileSync(path.join(worktree, 'out.txt'), 'utf8').trim();

  beforeEach(async () => {
    sandbox = createSandbox();
    project = await cloneProject(sandbox);
    await lm(['create', 'user/scripted', '--repo', 'project']);
    worktree = path.join(project, 'user-scripted');
  });

  afterEach(() => {
    destroySandbox(sandbox);
  });

  it('runs the script inside the chosen worktree', async () => {
    writeScript('where', 'pwd > out.txt');

    const { error } = await lm(['run', 'where', '--repo', 'project', '--branch', 'user/scripted']);

    expect(error).toBeUndefined();
    expect(readOutput()).toBe(worktree);
  });

  it('passes the worktree context as environment variables', async () => {
    writeScript('context', 'printf "%s\\n" "$LM_ROOT" "$LM_MAIN_DIR" "$LM_WORKTREE_DIR" "$LM_BRANCH" "$LM_FOLDER" > out.txt');

    await lm(['run', 'context', '--repo', 'project', '--branch', 'user/scripted']);

    expect(readOutput().split('\n')).toEqual([
      project,
      path.join(project, 'main'),
      worktree,
      'user/scripted',
      'user-scripted',
    ]);
  });

  it('exits with the script exit code when it fails', async () => {
    writeScript('fail', 'exit 3');

    const { error } = await lm(['run', 'fail', '--repo', 'project', '--branch', 'user/scripted']);

    expect(error?.oclif?.exit).toBe(3);
  });

  it('uses the shebang of an executable script', async () => {
    writeScript('node-script', "#!/usr/bin/env node\nrequire('fs').writeFileSync('out.txt', 'from node')\n", 0o755);

    const { error } = await lm(['run', 'node-script', '--repo', 'project', '--branch', 'user/scripted']);

    expect(error).toBeUndefined();
    expect(readOutput()).toBe('from node');
  });

  it('falls back to sh when the script is not executable and SHELL is unset', async () => {
    const shell = process.env.SHELL;
    delete process.env.SHELL;
    writeScript('plain', 'echo "$0" > out.txt');

    try {
      const { error } = await lm(['run', 'plain', '--repo', 'project', '--branch', 'user/scripted']);

      expect(error).toBeUndefined();
      expect(readOutput()).toContain('plain');
    } finally {
      process.env.SHELL = shell;
    }
  });

  it('errors when the script does not exist', async () => {
    const { error } = await lm(['run', 'missing', '--repo', 'project', '--branch', 'user/scripted']);

    expect(error?.message).toBe('Script does not exist.');
  });

  it('errors when the worktree does not exist', async () => {
    writeScript('where', 'pwd > out.txt');

    const { error } = await lm(['run', 'where', '--repo', 'project', '--branch', 'nope']);

    expect(error?.message).toBe('Worktree does not exist.');
  });
});
