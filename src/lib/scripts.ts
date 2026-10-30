import { spawn } from 'node:child_process';
import * as fs from 'node:fs';

export interface ScriptContext {
  root: string;
  mainDir: string;
  worktreeDir: string;
  branch: string;
  folder: string;
}

async function isExecutable(scriptPath: string): Promise<boolean> {
  return fs.promises
    .access(scriptPath, fs.constants.X_OK)
    .then(() => true)
    .catch(() => false);
}

export async function runScript(
  scriptPath: string,
  context: ScriptContext,
): Promise<number> {
  const [command, args] = (await isExecutable(scriptPath))
    ? [scriptPath, []]
    : [process.env.SHELL || 'sh', [scriptPath]];

  return new Promise((resolve, reject) => {
    const script = spawn(command, args, {
      cwd: context.worktreeDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        LM_ROOT: context.root,
        LM_MAIN_DIR: context.mainDir,
        LM_WORKTREE_DIR: context.worktreeDir,
        LM_BRANCH: context.branch,
        LM_FOLDER: context.folder,
      },
    });

    script.on('close', (code) => resolve(code ?? 1));
    script.on('error', reject);
  });
}
