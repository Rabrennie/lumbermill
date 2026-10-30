import { runCommand } from '@oclif/test';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

export interface Sandbox {
  dir: string;
  configDir: string;
  remote: string;
}

export function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

export function createSandbox(): Sandbox {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lumbermill-')));
  const configDir = path.join(dir, 'config');
  process.env.LM_CONFIG_DIR = configDir;

  const seed = path.join(dir, 'seed');
  fs.mkdirSync(seed);
  git(seed, 'init', '--initial-branch=main');
  git(seed, '-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '--allow-empty', '-m', 'initial');

  const remote = path.join(dir, 'remote.git');
  git(dir, 'clone', '--bare', seed, remote);

  return { dir, configDir, remote };
}

export function destroySandbox(sandbox: Sandbox): void {
  delete process.env.LM_CONFIG_DIR;
  fs.rmSync(sandbox.dir, { recursive: true, force: true });
}

export function lm(args: string[]) {
  return runCommand(args, { root });
}

export async function cloneProject(sandbox: Sandbox): Promise<string> {
  const cwd = process.cwd();
  process.chdir(sandbox.dir);
  try {
    const { error } = await lm(['clone', sandbox.remote, 'project']);
    if (error) throw error;
  } finally {
    process.chdir(cwd);
  }

  return path.join(sandbox.dir, 'project');
}
