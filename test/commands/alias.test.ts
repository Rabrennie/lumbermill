import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, lm, type Sandbox } from '../helpers';

describe('alias', () => {
  let sandbox: Sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    destroySandbox(sandbox);
  });

  const aliases = () =>
    JSON.parse(fs.readFileSync(path.join(sandbox.configDir, 'config.json'), 'utf8')).aliases;

  it('sets, lists and deletes an alias', async () => {
    await lm(['alias', 'set', 'mk', '"create --repo project"']);
    expect(aliases()).toEqual({ mk: 'create --repo project' });

    const { stdout } = await lm(['alias', 'list']);
    expect(stdout).toContain('mk  create --repo project');

    await lm(['alias', 'delete', 'mk']);
    expect(aliases()).toEqual({});
  });

  it('refuses to shadow a built-in command', async () => {
    const { error } = await lm(['alias', 'set', 'create', 'pull']);

    expect(error?.message).toBe('create is already a command');
  });

  describe('running an alias', () => {
    let project: string;

    beforeEach(async () => {
      project = await cloneProject(sandbox);
    });

    it('runs the expansion when given no arguments', async () => {
      await lm(['alias', 'set', 'ls', '"alias list"']);

      const { error, stdout } = await lm(['ls']);

      expect(error).toBeUndefined();
      expect(stdout).toContain('ls  alias list');
    });

    it('passes positional arguments through to the expansion', async () => {
      await lm(['alias', 'set', 'mk', '"create --repo project"']);

      const { error } = await lm(['mk', 'feat/x']);

      expect(error).toBeUndefined();
      expect(fs.existsSync(path.join(project, 'feat-x'))).toBe(true);
    });

    it('passes positional arguments and flags through to the expansion', async () => {
      await lm(['alias', 'set', 'mk', 'create']);

      const { error } = await lm(['mk', 'feat/y', '--repo', 'project']);

      expect(error).toBeUndefined();
      expect(fs.existsSync(path.join(project, 'feat-y'))).toBe(true);
    });

    it('errors with just the alias name when it is unknown', async () => {
      const { error } = await lm(['nope', 'feat/z']);

      expect(error?.message).toBe('Alias nope not found.');
    });
  });
});
