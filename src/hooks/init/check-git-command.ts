import { Hook } from '@oclif/core';
import { spawn } from 'node:child_process';

const hook: Hook<'init'> = async function () {
  // check if the git command exists
  // if not, throw an error
  await new Promise((resolve) => {
    const git = spawn('git', ['--version']);
    git.on('close', resolve);
    git.on('error', () => {
      this.error('git command not found. Please install git and try again.');
    });
  });
};

export default hook;
