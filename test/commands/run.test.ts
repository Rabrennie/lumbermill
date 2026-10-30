import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cloneProject, createSandbox, destroySandbox, git, lm, type Sandbox } from '../helpers';

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

  const runFrom = async (cwd: string, args: string[]) => {
    const previous = process.cwd();
    process.chdir(cwd);
    try {
      return await lm(args);
    } finally {
      process.chdir(previous);
    }
  };

  describe('without --repo', () => {
    beforeEach(() => {
      writeScript('where', 'pwd > out.txt');
    });

    it('detects the repo from the default branch folder', async () => {
      const { error } = await runFrom(path.join(project, 'main'), ['run', 'where', '--branch', 'user/scripted']);

      expect(error).toBeUndefined();
      expect(readOutput()).toBe(worktree);
    });

    it('detects the repo from another worktree', async () => {
      const { error } = await runFrom(worktree, ['run', 'where', '--branch', 'user/scripted']);

      expect(error).toBeUndefined();
      expect(readOutput()).toBe(worktree);
    });
  });

  describe('without --branch', () => {
    const readContext = () => fs.readFileSync(path.join(project, 'context.txt'), 'utf8').trim().split('\n');

    beforeEach(() => {
      writeScript('context', 'printf "%s\\n" "$LM_WORKTREE_DIR" "$LM_FOLDER" "$LM_BRANCH" > "$LM_ROOT/context.txt"');
    });

    it('uses the worktree it is run from', async () => {
      const { error } = await runFrom(worktree, ['run', 'context']);

      expect(error).toBeUndefined();
      expect(readContext()).toEqual([worktree, 'user-scripted', 'user/scripted']);
    });

    it('uses the worktree when run from a subdirectory of it', async () => {
      const subdirectory = path.join(worktree, 'nested', 'deeper');
      fs.mkdirSync(subdirectory, { recursive: true });

      const { error } = await runFrom(subdirectory, ['run', 'context']);

      expect(error).toBeUndefined();
      expect(readContext()).toEqual([worktree, 'user-scripted', 'user/scripted']);
    });

    it('uses the folder, not the branch name, when they differ', async () => {
      const main = path.join(project, 'main');
      git(main, 'checkout', '-b', 'feature/other');

      const { error } = await runFrom(main, ['run', 'context']);

      expect(error).toBeUndefined();
      expect(readContext()).toEqual([main, 'main', 'feature/other']);
    });

    describe('when not inside a worktree', () => {
      let binDir: string;
      let originalPath: string | undefined;

      const writeFzf = (contents: string) => {
        fs.writeFileSync(path.join(binDir, 'fzf'), `#!/bin/sh\n${contents}\n`, { mode: 0o755 });
      };

      const setInteractive = (isTTY: boolean) => {
        Object.defineProperty(process.stdin, 'isTTY', { value: isTTY, configurable: true });
      };

      beforeEach(() => {
        binDir = path.join(sandbox.dir, 'bin');
        fs.mkdirSync(binDir);
        fs.symlinkSync(execFileSync('which', ['git'], { encoding: 'utf8' }).trim(), path.join(binDir, 'git'));
        originalPath = process.env.PATH;
        process.env.PATH = `${binDir}:/bin:/usr/bin`;
        setInteractive(true);
      });

      afterEach(() => {
        process.env.PATH = originalPath;
        setInteractive(false);
      });

      it('picks a worktree with fzf', async () => {
        writeFzf(`tee "${sandbox.dir}/fzf-input.txt" | grep '^user-scripted'`);

        const { error } = await runFrom(project, ['run', 'context']);

        expect(error).toBeUndefined();
        expect(readContext()).toEqual([worktree, 'user-scripted', 'user/scripted']);
        expect(fs.readFileSync(path.join(sandbox.dir, 'fzf-input.txt'), 'utf8').split('\n')).toEqual([
          'main\tmain',
          'user-scripted\tuser/scripted',
        ]);
      });

      it('exits without running the script when fzf is cancelled', async () => {
        writeFzf('exit 130');

        const { error } = await runFrom(project, ['run', 'context']);

        expect(error?.oclif?.exit).toBe(130);
        expect(fs.existsSync(path.join(project, 'context.txt'))).toBe(false);
      });

      it('errors instead of opening fzf when not run from a terminal', async () => {
        writeFzf(`touch "${sandbox.dir}/fzf-ran"`);
        setInteractive(false);

        const { error } = await runFrom(project, ['run', 'context']);

        expect(error?.message).toBe('Not inside a worktree. Pass --branch or run from a worktree.');
        expect(fs.existsSync(path.join(sandbox.dir, 'fzf-ran'))).toBe(false);
      });

      it('errors when fzf is not installed', async () => {
        process.env.PATH = binDir;

        const { error } = await runFrom(project, ['run', 'context']);

        expect(error?.message).toBe('Not inside a worktree. Pass --branch or run from a worktree.');
      });
    });
  });
});
