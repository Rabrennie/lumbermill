import { spawn } from 'node:child_process';

export class FzfNotFoundError extends Error {}

export async function pickWithFzf(
  lines: string[],
  prompt: string,
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const fzf = spawn('fzf', ['--height', '10', '--border', '--prompt', prompt], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    let output = '';
    fzf.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    fzf.on('error', (error: NodeJS.ErrnoException) => {
      reject(error.code === 'ENOENT' ? new FzfNotFoundError() : error);
    });

    fzf.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else if (code === 1 || code === 130) {
        resolve(undefined);
      } else {
        reject(new Error(`fzf exited with code ${code}.`));
      }
    });

    fzf.stdin.on('error', () => {});
    fzf.stdin.end(lines.join('\n'));
  });
}
