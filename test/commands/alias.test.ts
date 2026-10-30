import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSandbox, destroySandbox, lm, type Sandbox } from '../helpers';

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
});
