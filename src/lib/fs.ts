import * as fs from 'node:fs';

export function normalizePath(path: string): string {
  return path.replace(/\/$/, '');
}

export async function pathExists(path: string): Promise<boolean> {
  return fs.promises
    .access(path)
    .then(() => true)
    .catch(() => false);
}
