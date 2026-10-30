import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, git, lm, type Sandbox } from '../helpers';

describe('worktree commands', () => {
  let sandbox: Sandbox;
  let project: string;

  beforeEach(async () => {
    sandbox = createSandbox();
    project = await cloneProject(sandbox);
  });

  afterEach(() => {
    destroySandbox(sandbox);
  });

  it('creates a worktree for a new branch', async () => {
    const { error, stdout } = await lm(['create', 'user/ticket-1/thing', '--repo', 'project']);

    expect(error).toBeUndefined();
    expect(stdout).toContain(`in ${project}/user-ticket-1-thing`);
    expect(git(path.join(project, 'user-ticket-1-thing'), 'branch', '--show-current').trim()).toBe('user/ticket-1/thing');
  });

  it('creates a worktree based on another branch', async () => {
    await lm(['create', 'parent', '--repo', 'project']);
    const parent = path.join(project, 'parent');
    git(parent, '-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '--allow-empty', '-m', 'parent work');

    const { error } = await lm(['create', 'child', '--repo', 'project', '--from', 'parent']);

    expect(error).toBeUndefined();
    expect(git(path.join(project, 'child'), 'rev-parse', 'HEAD')).toBe(git(parent, 'rev-parse', 'HEAD'));
  });

  it('errors when the branch to base on does not exist', async () => {
    const { error } = await lm(['create', 'child', '--repo', 'project', '--from', 'nope']);

    expect(error?.message).toBe('Branch nope does not exist.');
    expect(fs.existsSync(path.join(project, 'child'))).toBe(false);
  });

  it('fails to create a worktree for a branch that already exists', async () => {
    await lm(['create', 'existing', '--repo', 'project']);

    const { error } = await lm(['create', 'existing', '--repo', 'project']);

    expect(error?.message).toContain('Branch already exists');
  });

  it('pulls an existing remote branch into a worktree', async () => {
    git(path.join(project, 'main'), 'push', 'origin', 'main:feature/remote');
    git(path.join(project, 'main'), 'fetch', 'origin');

    const { error } = await lm(['pull', 'feature/remote', '--repo', 'project']);

    expect(error).toBeUndefined();
    expect(git(path.join(project, 'feature-remote'), 'branch', '--show-current').trim()).toBe('feature/remote');
  });

  it('removes a worktree and prunes it from git', async () => {
    await lm(['create', 'to-remove', '--repo', 'project']);

    const { error } = await lm(['rm', 'to-remove', '--repo', 'project']);

    expect(error).toBeUndefined();
    expect(fs.existsSync(path.join(project, 'to-remove'))).toBe(false);
    expect(git(path.join(project, 'main'), 'worktree', 'list')).not.toContain('to-remove');
  });

  it('removes a worktree with uncommitted changes', async () => {
    await lm(['create', 'dirty', '--repo', 'project']);
    fs.writeFileSync(path.join(project, 'dirty', 'untracked.txt'), 'wip');

    const { error } = await lm(['rm', 'dirty', '--repo', 'project']);

    expect(error).toBeUndefined();
    expect(fs.existsSync(path.join(project, 'dirty'))).toBe(false);
  });

  it('errors when removing a worktree that does not exist', async () => {
    const { error } = await lm(['rm', 'nope', '--repo', 'project']);

    expect(error?.message).toBe('Worktree does not exist.');
  });
});
