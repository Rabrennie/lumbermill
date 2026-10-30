import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, git, lm, type Sandbox } from '../helpers';

describe('lifecycle hooks', () => {
  let sandbox: Sandbox;
  let project: string;

  const writeHook = (name: string, contents: string) => {
    const hooksDir = path.join(project, '.lumbermill', 'scripts', 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(path.join(hooksDir, name), contents);
  };

  const read = (file: string) => fs.readFileSync(path.join(project, file), 'utf8').trim();

  beforeEach(async () => {
    sandbox = createSandbox();
    project = await cloneProject(sandbox);
  });

  afterEach(() => {
    destroySandbox(sandbox);
  });

  describe('post-create', () => {
    beforeEach(() => {
      writeHook('post-create', 'echo "$LM_BRANCH $(pwd)" > "$LM_ROOT/post-create.txt"');
    });

    it('runs in the new worktree after create', async () => {
      const { error } = await lm(['create', 'feat/new', '--repo', 'project']);

      expect(error).toBeUndefined();
      expect(read('post-create.txt')).toBe(`feat/new ${path.join(project, 'feat-new')}`);
    });

    it('runs in the new worktree after pull', async () => {
      git(path.join(project, 'main'), 'push', 'origin', 'main:feat/remote');
      git(path.join(project, 'main'), 'fetch', 'origin');

      const { error } = await lm(['pull', 'feat/remote', '--repo', 'project']);

      expect(error).toBeUndefined();
      expect(read('post-create.txt')).toBe(`feat/remote ${path.join(project, 'feat-remote')}`);
    });

    it('fails with the hook exit code but keeps the worktree', async () => {
      writeHook('post-create', 'exit 5');

      const { error } = await lm(['create', 'feat/broken', '--repo', 'project']);

      expect(error?.message).toBe('post-create hook failed with exit code 5.');
      expect(error?.oclif?.exit).toBe(5);
      expect(fs.existsSync(path.join(project, 'feat-broken'))).toBe(true);
    });
  });

  describe('pre-remove', () => {
    beforeEach(async () => {
      await lm(['create', 'feat/old', '--repo', 'project']);
    });

    it('runs while the worktree still exists, then removes it', async () => {
      writeHook('pre-remove', 'test -d "$LM_WORKTREE_DIR" && echo "$LM_FOLDER" > "$LM_ROOT/pre-remove.txt"');

      const { error } = await lm(['rm', 'feat/old', '--repo', 'project']);

      expect(error).toBeUndefined();
      expect(read('pre-remove.txt')).toBe('feat-old');
      expect(fs.existsSync(path.join(project, 'feat-old'))).toBe(false);
    });

    it('keeps the worktree when the hook fails', async () => {
      writeHook('pre-remove', 'exit 1');

      const { error } = await lm(['rm', 'feat/old', '--repo', 'project']);

      expect(error?.message).toBe('pre-remove hook failed with exit code 1.');
      expect(fs.existsSync(path.join(project, 'feat-old'))).toBe(true);
      expect(git(path.join(project, 'main'), 'worktree', 'list')).toContain('feat-old');
    });
  });
});
